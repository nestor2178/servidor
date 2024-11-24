import { Outlet, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePersist from "../../hooks/usePersist";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";
import PulseLoader from "react-spinners/PulseLoader";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type CustomError = FetchBaseQueryError & {
    data: {
        message: string;
    };
};

const PersistLogin = () => {
    const [persist] = usePersist();
    const token = useSelector(selectCurrentToken);
    const effectRan = useRef(false);

    const [trueSuccess, setTrueSuccess] = useState<boolean>(false);
    const [refresh, {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        error
    }] = useRefreshMutation()

    useEffect(() => {
        if (effectRan.current === true || process.env.NODE_ENV !== "development") {
            const verifyRefreshToken = async () => {
                console.log("verificando token de actualización");
                try {
                    await refresh({});
                    setTrueSuccess(true);
                } catch (err) {
                    console.error(err);
                }
            };

            if (!token && persist) verifyRefreshToken();
        }

        return () => {
            effectRan.current = true;
        };
    }, [token, persist, refresh]);

    let content;
    if (!persist) {
        console.log("no persist");
        content = <Outlet />;
    } else if (isLoading) {
        console.log("loading");
        content = <PulseLoader color={"#FFF"} />;
    } else if (isError) {
        console.log("error");

        if ("data" in error) {
            const errorMessage = (error as CustomError).data.message;
            content = (
                <p className="errmsg">
                    {`${errorMessage} - `}
                    <Link to="/login">Por favor inicie sesión nuevamente</Link>.
                </p>
            );
        } else {
            content = (
                <p className="errmsg">
                    {`An error occurred - `}
                    <Link to="/login">Por favor inicie sesión nuevamente</Link>.
                </p>
            );
        }
    } else if (isSuccess && trueSuccess) {
        console.log("success");
        content = <Outlet />;
    } else if (token && isUninitialized) {
        console.log("token and uninit");
        content = <Outlet />;
    }

    return content;
};

export default PersistLogin;
