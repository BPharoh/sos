import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Dialog, Button } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

import { db } from '../DataLayer/FirestoreInit';
import { useFetchMessagesByIdQuery, resetForm, togglePopover, toggleDeletePopover } from '../features/customTextSlice';
import { auth } from '../app/services/FirebaseAuth';
import { CustomText } from '../app/model';
import DiscardPopover from '../Components/DiscardPopover';


const CustomTextView = () => {
  /** Shows results from database
   * allows user to delete customTexts or edit in popover 
   */

  const dispatch = useDispatch();
  const [user] = useAuthState(auth);
  const uid = user?.uid;
  let open: boolean = useSelector((state: any) => state.customText.popoverState);
  const customText: CustomText = useSelector((state: any) => state.customText.customText)
  const [objectState, setObjectState] = useState(customText);
  const deletePopoverOpen = useSelector((state: any) => state.customText.deletePopoverOpen)
  const [deleteId, setDeleteId] = useState("");

  const {
    data,
    isFetching,
  } = useFetchMessagesByIdQuery({ id: uid });


  /*POPOVER FUNCTIONS FOR EDITING MESSAGES */
  function editButtonHandler(e: any, id: string) {
    dispatch(togglePopover());
    if (data) {
      const currentItem = (data.filter((item) => item.id === id))[0];
      setObjectState(currentItem);
    }

  }

  const handleChange = (e: any) => {
    setObjectState({ ...objectState, [e.target.name]: e.target.value });
  };

  function closeHandler() {
    dispatch(togglePopover());
  }


  async function deleteHandler(e: any, id: string) {
    setDeleteId(id);
    dispatch(toggleDeletePopover());

  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, 'customTexts', objectState.id), {
        title: objectState.title,
        message: objectState.message,
        default: objectState.default,
      })
    } catch (error: any) {
      alert(error)
    }
    dispatch(resetForm());
    dispatch(togglePopover());
  }

  /*END EDITPOPOVER FUNCTIONS */


  /** Delete popover functions */

  function deleteCloseHandler() {
    dispatch(toggleDeletePopover)

  }

  const yesHandler = async () => {
    try {
      await deleteDoc(doc(db, 'customTexts', deleteId))
        .then(() => console.log('id:', deleteId));

    } catch (error: any) {
      console.log(error);
    }
    setDeleteId("");
    dispatch(toggleDeletePopover());
  }

  const noHandler = () => {
    dispatch(toggleDeletePopover());
    return
  }


  return (
    <React.Fragment>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Available Messaging Text
      </Typography>
      <Table size="small" className="viewsTable">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!isFetching && data?.length !== 0 ? (data?.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell>{row.message}</TableCell>
              <TableCell><EditIcon className='icon' id={`icon${row.id}`}
                onClick={(e) => editButtonHandler(e, row.id)} />
              </TableCell>
              <TableCell> <DeleteIcon className='icon' id={`delete${row.id}`} onClick={(e) => deleteHandler(e, row.id)} /></TableCell>
            </TableRow>
          )))
            : <></>
          }
        </TableBody>
      </Table>


      <Dialog
        className="editMessagesDialog"
        open={open}
        onClose={closeHandler}
        PaperProps={{
          sx: {
            height: '400px'
          }
        }}
      >
        {customText ?
          <form onChange={handleChange}>
            <label htmlFor="name">Title</label><input
              defaultValue={objectState.title}
              type="text"
              name="title"
              id="titleInput"></input>

            <label htmlFor="phone">Message</label><input
              type="text"
              name="message"
              id="messageInput"
              defaultValue={objectState.message}
            ></input>

            <div>
              <Button type="submit" onClick={handleSubmit}>Save</Button>
              <Button onClick={closeHandler}>Close</Button>
            </div>
          </form>
          : <p>Awaiting data</p>
        }
      </Dialog >



      <DiscardPopover
        yesHandler={yesHandler}
        noHandler={noHandler}
        deletePopoverOpen={deletePopoverOpen}
        closeHandler={deleteCloseHandler}
      />


    </React.Fragment >
  );
};

export default CustomTextView;