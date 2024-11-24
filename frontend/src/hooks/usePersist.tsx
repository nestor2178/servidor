import { Dispatch, SetStateAction, useState, useEffect } from "react";

const usePersist = (): [boolean, Dispatch<SetStateAction<boolean>>] => {
    const storedPersist = localStorage.getItem("persist") ?? "false"; // Si es null, usa "false" como valor predeterminado
    const [persist, setPersist] = useState<boolean>(JSON.parse(storedPersist));

    useEffect(() => {
        localStorage.setItem("persist", JSON.stringify(persist));
    }, [persist]);

    return [persist, setPersist];
}

export default usePersist;
