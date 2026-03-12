// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Outlet, useNavigate } from "react-router-dom";
// import Spinner from "../components/Spinner";
// import { getUserInfo } from './../reducer/authSlice';

// const PrivateRoute = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const [ok, setOk] = useState(true);
//   const navigate = useNavigate();

//   console.log("userrrrrrrr",user);
  

//   // Memoize the userInfo processing to avoid unnecessary computations
//   const processedUserInfo = useMemo(() => {
//     return user ? user : null;
//   }, [user]);

//   useEffect(() => {
//     if (!processedUserInfo) {
//       dispatch(getUserInfo());
//     }
//   }, [dispatch, processedUserInfo]);

//   useEffect(() => {
//     if (!user) {
//       navigate("/login");
//     }
//   }, [user, navigate]);

//   useEffect(() => {
//     setOk(!!processedUserInfo);
//   }, [processedUserInfo]);

//   return ok ? <Outlet /> : <Spinner />;
// };

// export default PrivateRoute;


import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { getUserInfo } from "../reducer/authSlice";

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const { user, loading, isFetched } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isFetched) {
      dispatch(getUserInfo());
    }
  }, [dispatch, isFetched]);

  if (loading || !isFetched) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
