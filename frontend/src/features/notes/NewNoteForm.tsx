import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewNoteMutation } from "./notesApiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface User {
  id: string;
  username: string;
}

interface NewNoteFormProps {
  users: User[];
}

const NewNoteForm: React.FC<NewNoteFormProps> = ({ users }) => {
  const [addNewNote, { isLoading, isSuccess, isError, error }] =
    useAddNewNoteMutation();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [userId, setUserId] = useState(users[0]?.id || "");

  const TITLE_REGEX = /^[A-z0-9\s]{3,20}$/;
  const TEXT_REGEX = /^[A-z0-9\s!@#$%.,?]{10,100}$/;

  const [validTitle, setValidTitle] = useState(false);
  const [validText, setValidText] = useState(false);


  useEffect(() => {
    if (isSuccess) {
      setTitle("");
      setText("");
      setUserId(users[0]?.id || "");
      navigate("/dash/notes");
    }
  }, [isSuccess, navigate, users]);

  useEffect(() => {
    setValidTitle(TITLE_REGEX.test(title));
  }, [title]);

  useEffect(() => {
    setValidText(TEXT_REGEX.test(text));
  }, [text]);

  useEffect(() => {
    if (isError) {
      console.error('Error al crear la nota:', error);
    }
  }, [isError, error]);

  const onTitleChanged = (e: ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const onTextChanged = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setText(e.target.value);
  const onUserIdChanged = (e: ChangeEvent<HTMLSelectElement>) =>
    setUserId(e.target.value);

  const canSave = [validTitle, validText, userId].every(Boolean) && !isLoading;

  const onSaveNoteClicked = async (e: FormEvent) => {
    e.preventDefault();
    if (canSave) {
      await addNewNote({ user: userId, title, text });
    }
  };

  const options = users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.username}
    </option>
  ));

  const errClass = isError ? "errmsg" : "offscreen";
  let errMsg = "";
  if (error) {
    if ("data" in error) {
      const fetchError = error as FetchBaseQueryError;
      if (
        fetchError.data &&
        typeof fetchError.data === "object" &&
        "message" in fetchError.data
      ) {
        errMsg = (fetchError.data as { message: string }).message;
      }
    } else if ("message" in error) {
      errMsg = (error as { message: string }).message;
    }
  }

  const validTitleClass = !title ? "form__input--incomplete" : "";
  const validTextClass = !text ? "form__input--incomplete" : "";

  return (
    <>
      <p className={errClass}>{errMsg}</p>

      <form className="form" onSubmit={onSaveNoteClicked}>
        <div className="form__title-row">
          <h2>Nueva Nota</h2>
          <div className="form__action-buttons">
            <button className="icon-button" title="Guardar" disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>
        <label className="form__label" htmlFor="title">
          Titulo:
        </label>
        <input
          className={`form__input ${validTitleClass}`}
          id="title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          onChange={onTitleChanged}
        />

        <label className="form__label" htmlFor="text">
          Texto:
          {!validText && <span className="form__error"> [10-100 caracteres, incluidos !@#$%.,?]</span>}
        </label>
        <textarea
          className={`form__input form__input--text ${validTextClass}`}
          id="text"
          name="text"
          value={text}
          onChange={onTextChanged}
        />

        <label className="form__label" htmlFor="username">
          ASIGNADO A:
        </label>
        <select
          id="username"
          name="username"
          className={"form__select ${validTextClass}"}
          value={userId}
          onChange={onUserIdChanged}
        >
          {options}
        </select>
        {isLoading && <p>Cargando...</p>}
      </form>
    </>
  );
};

export default NewNoteForm;
