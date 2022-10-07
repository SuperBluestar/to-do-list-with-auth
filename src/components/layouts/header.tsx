import { useState } from "react";
// import HyperModal from "react-hyper-modal";
import { trpc } from "../../utils/trpc";
import { Button } from "../atoms/buttons";
import { LabelInput } from "../atoms/inputs";
import { env } from "../../env/client.mjs";
import { signInSchema, signUpSchema } from "../../server/common/validation/auth";
import { signIn, signOut, useSession } from "next-auth/react";
import ReactModal from "react-modal";

const Header = () => {
  const { data: session, status } = useSession();
  const [signInModal, openSignInModal] = useState<boolean>(false);
  const [signUpModal, openSignUpModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [nameErrors, setNameErrors] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [password, setPassword] = useState<string>("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string>("");
  const mutationSignUp = trpc.useMutation(["sign-up"]);
  const signUp = async () => {
    const valid = signUpSchema.safeParse({ name, email, password });
    if (valid.success) {
      try {
        setEmailErrors([]);
        setPasswordErrors([]);
        setNameErrors([]);
        setServerError("");
        const createdUser = await mutationSignUp.mutateAsync({ name, email, password });
        if (createdUser) {
          openSignUpModal(false);
          openSignInModal(true);
        } else {
          env.NEXT_PUBLIC_DEBUG && alert("Unknown error, check console");
        }
      } catch (err: any) {
        setServerError(err.message);
      }
    } else {
      setNameErrors(valid.error.flatten().fieldErrors.name || []);
      setEmailErrors(valid.error.flatten().fieldErrors.email || []);
      setPasswordErrors(valid.error.flatten().fieldErrors.password || []);
    }
  }
  return (
    <>
      <nav className="w-full h-header">
        <div className="container mx-auto h-full px-4 md:px-20 flex justify-end gap-8 items-center border-b border-white border-opacity-5">
          {
            status === "unauthenticated" && (
              <>
                <span id="sign-in-btn" className="cursor-pointer" onClick={() => openSignInModal(_prev => !_prev)}>SignIn</span>
                <span id="sign-up-btn" className="cursor-pointer" onClick={() => openSignUpModal(_prev => !_prev)}>SignUp</span>
              </>
            )
          }
          {
            status === "authenticated" && (
              <>
                <span className="font-bold" title={`${session.user?.id} ${session.user?.email} ${session.expires}`}>Logged as {session.user?.name?.toUpperCase()}</span>
                <span className="cursor-pointer" onClick={() => signOut()}>SignOut</span>
              </>
            )
          }
        </div>
      </nav>
      {/* <HyperModal
        isOpen={signInModal}
        requestClose={() => openSignInModal(false)}
        classes={{
          wrapperClassName: "z-50",
          portalWrapperClassName: "",
          contentClassName: "sign-modal p-10"
        }}
      > */}
      <ReactModal
        isOpen={signInModal}
        onRequestClose={() => openSignInModal(false)}
        overlayClassName="bg-white bg-opacity-50 fixed left-0 top-0 w-full h-full flex justify-center items-center"
        className="add-item-modal p-10 bg-white"
      >
        <div className="w-full h-full flex flex-col gap-4 justify-center">
          <LabelInput label="Email" type="email" value={email} onChange={setEmail} errors={emailErrors} />
          <LabelInput label="Password" type="password" value={password} onChange={setPassword} errors={passwordErrors} />
          { serverError && <span className="ml-24 text-red-500 text-xs">{serverError}</span> }
          <div className="flex justify-center items-center gap-8">
            <Button onClick={() => {
              const valid = signInSchema.safeParse({ email, password });
              if (valid.success) {
                setEmailErrors([]);
                setPasswordErrors([]);
                signIn("credentials", { redirect: false, email, password }).then((res) => {
                  console.log(res)
                  if (res?.ok) {
                    openSignInModal(false);
                  } else {
                    switch (res?.status) {
                      case 401:
                        setServerError("Failed to authorize.");
                        break;
                      case 403:
                        setServerError("Forbidden.");
                        break;
                      default:
                        setServerError(`Unknown error: ${res?.error}`)
                    }
                  }
                });
              } else {
                setEmailErrors(valid.error.flatten().fieldErrors.email || []);
                setPasswordErrors(valid.error.flatten().fieldErrors.password || []);
              }
            }}>SignIn</Button>
            <Button onClick={() => openSignInModal(false)}>Cancel</Button>
            <Button onClick={() => {
              openSignInModal(false);
              openSignUpModal(true);
            }}>SignUp</Button>
          </div>
        </div>
      {/* </HyperModal> */}
      </ReactModal>
      {/* <HyperModal
        isOpen={signUpModal}
        requestClose={() => openSignUpModal(false)}
        classes={{
          wrapperClassName: "z-50",
          portalWrapperClassName: "",
          contentClassName: "sign-modal p-10"
        }}
      > */}
      <ReactModal
        isOpen={signUpModal}
        onRequestClose={() => openSignUpModal(false)}
        overlayClassName="bg-white bg-opacity-50 fixed left-0 top-0 w-full h-full flex justify-center items-center"
        className="add-item-modal p-10 bg-white"
      >
        <div className="w-full h-full flex flex-col gap-4 justify-center">
          <LabelInput label="Name" type="text" value={name} onChange={setName} errors={nameErrors} />
          <LabelInput label="Email" type="email" value={email} onChange={setEmail} errors={emailErrors} />
          <LabelInput label="Password" type="password" value={password} onChange={setPassword} errors={passwordErrors} />
          { serverError && <span className="ml-24 text-red-500 text-xs">{serverError}</span> }
          <div className="flex justify-center items-center gap-8">
            <Button onClick={signUp}>SignUp</Button>
            <Button onClick={() => openSignInModal(false)}>Cancel</Button>
            <Button onClick={() => {
              openSignUpModal(false);
              openSignInModal(true);
            }}>SignIn</Button>
          </div>
        </div>
      </ReactModal>
      {/* </HyperModal> */}
    </>
  )
}

export default Header;
