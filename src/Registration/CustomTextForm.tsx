import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Grid, TextField, Button, /* Checkbox, FormControlLabel */ } from '@mui/material';
import { doc, setDoc, /* collection, getDocs, query, where, updateDoc */ } from "@firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { useAuthState } from 'react-firebase-hooks/auth';

import { db } from '../DataLayer/FirestoreInit';
import { CustomText } from '../app/model';
import { auth } from '../app/services/FirebaseAuth';
import { setCustomText, resetForm } from '../features/customTextSlice';
import { useFetchMessagesByIdQuery } from '../features/customTextSlice';


export default function CustomTextForm() {

  const [user] = useAuthState(auth);
  const uid = user?.uid;
  const dispatch = useDispatch();
  const [buttonAction] = useState<string>('Save Text')
  const [readyState, setReadyState] = useState<boolean>(false);


  const customText: CustomText = useSelector((state: any) => state.customText.customText)
  // const [objectState, setObjectState] = useState(init);

  const { data } = useFetchMessagesByIdQuery({ id: uid })

  const titleInput = useRef<HTMLInputElement>();
  const messageInput = useRef<HTMLInputElement>();

  const defaultText = data?.filter((item) => item.id === 'DEFAULT_MESSAGE')[0];

  function handleChange(e: any) {
    dispatch(setCustomText({ [e.target.name]: e.target.value }))
    if (readyState === true) { setReadyState(false) }

  }

  function completeData() {
    if (!titleInput.current!.value || !messageInput.current!.value) {
      alert("Some fields are missing data");
      return null;
    } else {
      dispatch(setCustomText({ uid: uid, id: uuidv4() }));
      setReadyState(true);
    }

  }

  async function handleSubmit() {
    completeData();

  }

  async function sendData() {
    await setDoc(doc(db, 'customTexts', customText.id), {
      id: customText.id,
      message: customText.message,
      title: customText.title,
      uid: customText.uid,
      default: customText.default
    }, { merge: true })
      .then(() => { console.log('submitted to firestore') })
      .catch((err) => alert(err));
    dispatch(resetForm());

    console.log(customText);
  }


  useEffect(() => {

    sendData();
    //eslint-disable-next-line
  }, [readyState])

  return (
    <React.Fragment>
      <Typography sx={{ mt: '3rem' }} component="h2" variant="h6" color="primary" gutterBottom>
        Add Customized Text
      </Typography>
      <p>   Your current default text message is:
        <span style={{ display: 'block', fontWeight: '800', margin: '5% 30%', padding: '2rem', border: '1px solid black' }}>{defaultText?.message}</span>
        This is the message that will be sent if no specific signal type is chosen.
        You can add personalised messages below.</p>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            id="title"
            name="title"
            label="Title"
            inputRef={titleInput}
            fullWidth
            autoComplete="cc-title"
            variant="standard"
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="message"
            name="message"
            label="Message"
            inputRef={messageInput}
            fullWidth
            autoComplete="cc-Message"
            variant="standard"
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ mt: 3, ml: 1 }}
          >
            {buttonAction}
          </Button>
        </Grid>

      </Grid>
    </React.Fragment>
  );
}