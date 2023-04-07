import React, { useState } from 'react';
import { Typography, Grid, TextField, Button } from '@mui/material';
import { doc, setDoc } from "@firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from '../DataLayer/FirestoreInit';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../app/services/FirebaseAuth';
import { SignalsList } from '../app/model';

import { setStoreSignalsList, resetForm } from '../features/manageSignalSlice';
import { useFetchSignalsListByIdQuery } from '../features/manageSignalSlice';

const CustomSignalsView = () => {

    //for creating user's custom emergency types
    //used as a component in the custom signals page of the regWizard, for optional setup, and in manageSignals page
    const [buttonAction] = useState<string>('Save Signal')
    const dispatch = useDispatch();
    const storeSignal: SignalsList = useSelector((state: any) => state.storeSignalsList);
    const [user] = useAuthState(auth);

    //const [data] = useFetchSignalsListByIdQuery(user.uid);

    function handleChange(e: any) {
        dispatch(setStoreSignalsList({ [e.target.name]: e.target.value }))
    }

    function completeSignal() {
        dispatch(setStoreSignalsList({ uid: user?.uid, signalId: uuidv4() }));

    }

    async function handleSubmit() {
        console.log('clicked');
        completeSignal();
        try {
            await setDoc(doc(db, 'signalsList', storeSignal.signalId), {
                signalId: storeSignal.signalId,
                uid: user?.uid,
                name: storeSignal.name,
                recipients: storeSignal.recipients,
                presetMsg: "",
                cstTextId: storeSignal.cstTextId,
                createdAt: ""
            }, { merge: true })
                .then(() => { console.log('submitted to firestore') })
            dispatch(resetForm());
            // dispatch(triggerReload());
        }
        catch (error: any) {
            return { error: error.message }
        }
    }

    return (
        <div>

            <Typography sx={{ mt: '3rem' }} component="h2" variant="h6" color="primary" gutterBottom>
                Add Customized Signals
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="name"
                        name="name"
                        label="Signal Name"
                        fullWidth
                        autoComplete="cc-name"
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="recipients"
                        name="recipients"
                        label="Choose recipients"
                        fullWidth
                        autoComplete="cc-recipients"
                        variant="standard"
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="message"
                        name="message"
                        label="Choose message"
                        fullWidth
                        autoComplete="cc-message"
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


        </div>
    );
};

export default CustomSignalsView;