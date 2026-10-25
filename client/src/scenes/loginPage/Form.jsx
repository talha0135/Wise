import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Dropzone from "react-dropzone";
import { setLogin } from "../../state";
import { request } from "../../api";
import FlexBetween from "../../components/FlexBetween";

const registerSchema = yup.object().shape({
  firstName: yup.string().trim().min(2, "min 2 characters").max(50).required("required"),
  lastName: yup.string().trim().min(2, "min 2 characters").max(50).required("required"),
  email: yup.string().trim().email("invalid email").required("required"),
  password: yup.string().min(8, "min 8 characters").max(72, "max 72 characters").required("required"),
  location: yup.string().trim().max(100).required("required"),
  occupation: yup.string().trim().max(100).required("required"),
  picture: yup.mixed().required("profile picture is required"),
});

const loginSchema = yup.object().shape({
  email: yup.string().trim().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  location: "",
  occupation: "",
  picture: null,
};
const initialValuesLogin = { email: "", password: "" };

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const [snack, setSnack] = useState(null); // { text, severity }
  const [error, setError] = useState("");
  const location = useLocation();
  const [loggedOutNotice, setLoggedOutNotice] = useState(Boolean(location.state?.loggedOut));

  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  const register = async (values, onSubmitProps) => {
    const formData = new FormData();
    for (const key of ["firstName", "lastName", "email", "password", "location", "occupation"]) {
      formData.append(key, values[key]);
    }
    formData.append("picture", values.picture);
    try {
      await request("/auth/register", { method: "POST", form: formData });
      onSubmitProps.resetForm();
      setError("");
      setSnack({ text: "Tea is Ready: Successfully Registered", severity: "success" });
      setPageType("login");
    } catch (e) {
      setError(e.message);
    }
  };

  const login = async (values) => {
    try {
      const data = await request("/auth/login", { method: "POST", body: values });
      dispatch(setLogin({ user: data.user, token: data.token }));
      navigate("/home");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    setError("");
    if (isLogin) await login(values);
    if (isRegister) await register(values, onSubmitProps);
  };

  const field = (name, label, props = {}, gridColumn = "span 2", values, handlers) => (
    <TextField
      label={label}
      onBlur={handlers.handleBlur}
      onChange={handlers.handleChange}
      value={values[name]}
      name={name}
      error={Boolean(handlers.touched[name]) && Boolean(handlers.errors[name])}
      helperText={handlers.touched[name] && handlers.errors[name]}
      sx={{ gridColumn }}
      {...props}
    />
  );

  return (
    <>
      <Formik
        key={pageType}
        onSubmit={handleFormSubmit}
        initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
        validationSchema={isLogin ? loginSchema : registerSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
        }) => {
          const h = { handleBlur, handleChange, touched, errors };
          return (
            <form onSubmit={handleSubmit} noValidate>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
              >
                {isRegister && (
                  <>
                    {field("firstName", "First Name", {}, "span 2", values, h)}
                    {field("lastName", "Last Name", {}, "span 2", values, h)}
                    {field("location", "Location", {}, "span 4", values, h)}
                    {field("occupation", "Occupation", {}, "span 4", values, h)}
                    <Box
                      gridColumn="span 4"
                      border={`1px solid ${palette.neutral.medium}`}
                      borderRadius="5px"
                      p="1rem"
                    >
                      <Dropzone
                        accept={{
                          "image/jpeg": [".jpg", ".jpeg"],
                          "image/png": [".png"],
                          "image/gif": [".gif"],
                          "image/webp": [".webp"],
                        }}
                        multiple={false}
                        maxSize={5 * 1024 * 1024}
                        onDrop={(files) => {
                          setFieldValue("picture", files[0] || null);
                          setFieldTouched("picture", true, false);
                        }}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <Box
                            {...getRootProps()}
                            border={`2px dashed ${palette.primary.main}`}
                            p="1rem"
                            sx={{ "&:hover": { cursor: "pointer" } }}
                          >
                            <input {...getInputProps()} />
                            {!values.picture ? (
                              <p>Add Picture Here (image, max 5MB)</p>
                            ) : (
                              <FlexBetween>
                                <Typography>{values.picture.name}</Typography>
                                <EditOutlinedIcon />
                              </FlexBetween>
                            )}
                          </Box>
                        )}
                      </Dropzone>
                      {touched.picture && errors.picture && (
                        <Typography color="error" fontSize="0.75rem" mt="0.5rem">
                          {errors.picture}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}

                {field("email", "Email", { type: "email", autoComplete: "email" }, "span 4", values, h)}
                {field(
                  "password",
                  "Password",
                  { type: "password", autoComplete: isLogin ? "current-password" : "new-password" },
                  "span 4",
                  values,
                  h
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: "1.5rem" }}>
                  {error}
                </Alert>
              )}

              <Box>
                <Button
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    m: "2rem 0",
                    p: "1rem",
                    backgroundColor: palette.primary.main,
                    color: palette.background.alt,
                    "&:hover": { color: palette.primary.main },
                  }}
                >
                  {isLogin ? "LOGIN" : "REGISTER"}
                </Button>
                <Typography
                  onClick={() => {
                    setPageType(isLogin ? "register" : "login");
                    setError("");
                  }}
                  sx={{
                    textDecoration: "underline",
                    color: palette.primary.main,
                    "&:hover": { cursor: "pointer", color: palette.primary.light },
                  }}
                >
                  {isLogin
                    ? "Don't have an account? Sign Up here."
                    : "Already have an account? Login here."}
                </Typography>
              </Box>
            </form>
          );
        }}
      </Formik>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack?.severity || "success"} variant="filled" sx={{ width: "100%" }}>
          {snack?.text}
        </Alert>
      </Snackbar>
      <Snackbar
        open={loggedOutNotice}
        autoHideDuration={3000}
        onClose={() => setLoggedOutNotice(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" sx={{ width: "100%" }}>
          Please continue spilling the tea ! :)
        </Alert>
      </Snackbar>
    </>
  );
};

export default Form;
