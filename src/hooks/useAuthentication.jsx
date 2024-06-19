import { auth } from "../firebase/config";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    signInWithEmailAndPassword
} from 'firebase/auth';

import { useState, useEffect } from 'react';

export const useAuthentication = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);

    // cleanup
    // deal with memory leak
    const [cancelled, setCancelled] = useState(false);

    function checkIfIsCancelled() {
        if (cancelled) {
            return;
        }
    }

    // register
    const createUser = async (data) => {
        checkIfIsCancelled();

        setLoading(true);
        setError(null)

        try {
            const {user} = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            await updateProfile(user, {displayName: data.displayName});

            setLoading(false);
            return user;
        } catch (error) {
            console.log(error.message);
            console.log(typeof error.message);

            let systemErrorMessage;

            if(error.message.includes("Password")) {
                systemErrorMessage = "A senha precisa conter pelo menos 6 caracteres.";
            } else if(error.message.includes("emial-already")) {
                systemErrorMessage = "E-mail já cadastrado.";
            } else {
                systemErrorMessage = "Ocorreu um erro, por favor tente mais tarde.";
            }

            setLoading(false);
            setError(systemErrorMessage);
        }
    }

    // logout - sign out
    const logout = () => {
        checkIfIsCancelled()
        signOut(auth)
    }

    // login - sign in
    const login = async (data) => {
        checkIfIsCancelled()

        setLoading(true)
        setError(null)

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password)
            setLoading(false)
        } catch (error) {
            let systemErrorMessage;

            console.log(error.message);

            if(error.message.includes("invalid-credential")) {
                systemErrorMessage = "Credenciais inválidas"
            } else {
                systemErrorMessage = "Ocorreu um erro, por favor tente mais tarde.";
            }

            setLoading(false)
            setError(systemErrorMessage)
        }
    }

    useEffect(() => {
        return () => setCancelled(true);
    }, []);

    return {
        auth,
        createUser,
        error,
        loading,
        logout,
        login,
    };
}