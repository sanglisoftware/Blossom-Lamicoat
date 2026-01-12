import ThemeSwitcher from "@/components/ThemeSwitcher";
import logoUrl from "/vite.svg";
import illustrationUrl from "@/assets/images/illustration.svg";
import { FormInput, FormCheck } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BASE_URL } from "../config/config";
import { SuccessModalConfig } from "../AdminPanel/CommonModals/SuccessModal/SuccessModalConfig";
import SuccessModal from "../AdminPanel/CommonModals/SuccessModal/SuccessModal";


function Main() {

  const navigate = useNavigate();
  //Login Failed, Cannot Connect with Sever Modal Modal config
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState<SuccessModalConfig>({
    title: "",
    subtitle: "",
    icon: "CheckCircle",
    buttonText: "OK",
    onButtonClick: () => { }
  });

  //Login Modal (useState)
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  //Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});


  // Assume you are calling the backend like this
  async function login() {
    try {
      //validation
      const errors: Record<string, string> = {};
      if (!formData.username) errors.username = "Username is required.";
      if (!formData.password) errors.password = "Password is required.";

      //setting errors (validation)
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      //API Call
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });

      //Login Failed with invalid creadential, opne modal
      if (!response.ok) {
        setSuccessModalConfig({
          title: "Login Failed",
          subtitle: "Invalid Creadentials, Please try again..",
          icon: "XCircle",
          buttonText: "Ok",
          onButtonClick: () => {
            setIsSuccessModalOpen(false);
          }
        });
        setIsSuccessModalOpen(true);
        return;
      }
      const data = await response.json();

      // Save token and menu
      localStorage.setItem("token", data.token);

      localStorage.setItem("menu", data.menuJson);


      const decodeToken = (token: string) => {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
      };

      /// Save username and role changes created by om 25-11-2025
      const jwtData = decodeToken(data.token);

      const usernameFromToken = jwtData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const roleFromToken = jwtData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      localStorage.setItem("username", usernameFromToken);
      localStorage.setItem("role", roleFromToken);
      ///


      const setupAutoLogout = (token: string) => {
        const { exp } = decodeToken(token);
        const timeout = exp * 1000 - Date.now();

        if (timeout > 0) {
          setTimeout(() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }, timeout);
        }
      };

      // Call this after login
      setupAutoLogout(data.token);

      navigate("/"); // Go to dashboard

    } catch (error) {
      //error modal
      setSuccessModalConfig({
        title: "Error",
        subtitle: "Cannot connect to the server",
        icon: "XCircle",
        buttonText: "Ok",
        onButtonClick: () => {
          setIsSuccessModalOpen(false);
        }
      });
      setIsSuccessModalOpen(true);
      console.error(error);
    }
  }

  return (
    <>
      <div
        className={clsx([
          "p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        <ThemeSwitcher />
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Login Info */}
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href="" className="flex items-center pt-5 -intro-x">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  className="w-64"
                  src="BLFinal.png"
                />
                {/* <span className="ml-3 text-lg text-white"> Chitale Dairy </span> */}
              </a>
              <div className="my-auto">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  className="w-1/2 -mt-16 -intro-x"
                  src={illustrationUrl}
                />
                <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                  A few more clicks to <br />
                  sign in to your account.
                </div>
                <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                  Manage all your e-commerce accounts in one place
                </div>
              </div>
            </div>
            {/* END: Login Info */}
            {/* BEGIN: Login Form */}
            <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
              <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                  Sign In
                </h2>
                <div className="mt-2 text-center intro-x text-slate-400 xl:hidden">
                  A few more clicks to sign in to your account. Manage all your
                  e-commerce accounts in one place
                </div>
                <div className="mt-8 intro-x">
                  <FormInput
                    type="text"
                    className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, username: e.target.value })
                      if (value.trim()) {
                        setFormErrors((prev) => ({ ...prev, username: "" }));
                      }
                    }}
                  />
                  {formErrors.username && <p className="text-red-500 text-sm">{formErrors.username}</p>}
                  <FormInput
                    type="password"
                    className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px]"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, password: e.target.value })
                      if (value.trim()) {
                        setFormErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                  />
                  {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
                </div>
                <div className="flex mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                  <div className="flex items-center mr-auto">
                    <FormCheck.Input
                      id="remember-me"
                      type="checkbox"
                      className="mr-2 border"
                    />
                    <label
                      className="cursor-pointer select-none"
                      htmlFor="remember-me"
                    >
                      Remember me
                    </label>
                  </div>
                  {/* <a href="">Forgot Password?</a> */}
                </div>
                <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                  <Button
                    variant="primary"
                    className="w-full px-4 py-3 align-top xl:w-32 xl:mr-3"
                    onClick={() => login()}
                  >
                    Login
                  </Button>
                  {/* <Button
                    variant="outline-secondary"
                    className="w-full px-4 py-3 mt-3 align-top xl:w-32 xl:mt-0"
                  >
                    Register
                  </Button> */}
                </div>
              </div>
            </div>
            {/* END: Login Form */}
          </div>
        </div>
      </div>
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        {...successModalConfig}
      />
      {/* Login Failed, Cannot connect with Server Modal : END*/}
    </>
  );
}

export default Main;
