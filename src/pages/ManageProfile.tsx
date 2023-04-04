import React from 'react';
import ProfileForm from '../Registration/ProfileForm';
import { auth } from '../app/services/FirebaseAuth';

const ManageProfile = () => {

    const user = auth.currentUser;

    if (!user) { return <><h3>Please log in first to manage your profile.</h3></> }

    return (

        <ProfileForm />
    );
};

export default ManageProfile;