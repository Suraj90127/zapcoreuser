import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiLock, FiEdit, FiSave, FiX, FiCamera,
  FiCreditCard, FiShield, FiBell, FiGlobe,
  FiActivity, FiTrendingUp, FiDollarSign, FiPackage,
  FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle,
  FiSmartphone, FiMap, FiGift, FiAward, FiStar,
  FiClock, FiSettings, FiLogOut, FiHelpCircle,
  FiKey, FiCopy, FiCheck, FiSend, FiMessageSquare
} from "react-icons/fi";
import { 
  MdOutlineVerified, MdOutlineSecurity, 
  MdOutlineNotificationsActive, MdOutlineLanguage,
  MdOutlineVpnKey, MdWhatsapp
} from "react-icons/md";
import { GiGamepad, GiWallet, GiAchievement } from "react-icons/gi";
import { FaWhatsapp } from "react-icons/fa";
import { SiPrdotco } from "react-icons/si";

import { useTheme } from "../../contexts/ThemeContext";
import { getUserInfo, updateProfile, changePassword, verifyPassword } from "../../reducer/authSlice";
import axios from "axios";
import { whatsappnumber } from "../../utils/constant";

const UserAccount = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Redux State
  const { user, loading, passwordVerified } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // API Key states
  const [showFullKey, setShowFullKey] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyPassword, setKeyPassword] = useState("");
  const [keyVerified, setKeyVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyError, setKeyError] = useState("");
  
  // WhatsApp IP Feature states
  const [showIPInput, setShowIPInput] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState({ type: "", message: "" });
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    key: "",
    ipLocation: "",
    deviceInfo: ""
  });

  const [domainAddress, setDomainAddress] = useState("");


  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    key: "",
    language: "English",
    timezone: "UTC-5",
    bio: "",
    social: {
      twitter: "",
      discord: "",
      steam: ""
    },
    notifications: {
      email: true,
      push: true,
      marketing: false,
      weeklyReport: true,
      security: true,
      promotions: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Stats data from user
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    gamesPlayed: 0,
    achievements: 0,
    memberSince: "",
    lastActive: "",
    accountLevel: "Bronze",
    expPoints: 0,
    nextLevel: 1000
  });

  // Sync Redux user data to local state
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone?.toString() || "",
        key: user.key || "",
        language: user.language || "English",
        timezone: user.timezone || "UTC-5",
        bio: user.bio || "Gaming enthusiast",
        social: user.social || {
          twitter: "",
          discord: "",
          steam: ""
        },
        notifications: user.notifications || {
          email: true,
          push: true,
          marketing: false,
          weeklyReport: true,
          security: true,
          promotions: false
        }
      });

      // Pre-fill user details for WhatsApp
      setUserDetails(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone?.toString() || ""
      }));

      // Calculate account level based on totalggr
      const totalGGR = user.totalggr || 0;
      let level = "Bronze";
      let nextLevelXP = 1000;
      
      if (totalGGR >= 10000) {
        level = "Platinum";
        nextLevelXP = 20000;
      } else if (totalGGR >= 5000) {
        level = "Gold";
        nextLevelXP = 10000;
      } else if (totalGGR >= 1000) {
        level = "Silver";
        nextLevelXP = 5000;
      }

      setUserStats({
        totalSpent: user.balance || 0,
        gamesPlayed: Math.floor((user.totalggr || 0) / 100) || 0,
        achievements: Math.floor((user.totalggr || 0) / 50) || 0,
        memberSince: user.createdAt || new Date().toISOString(),
        lastActive: user.updatedAt || new Date().toISOString(),
        accountLevel: level,
        expPoints: user.totalggr || 0,
        nextLevel: nextLevelXP
      });
    } else {
      dispatch(getUserInfo());
    }
  }, [user, dispatch]);

  // Check password strength
  useEffect(() => {
    const password = passwordData.newPassword;
    if (!password) {
      setPasswordStrength({ score: 0, message: '', color: '' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]+/)) score++;
    if (password.match(/[A-Z]+/)) score++;
    if (password.match(/[0-9]+/)) score++;
    if (password.match(/[$@#&!]+/)) score++;

    const strengthMap = {
      0: { message: 'Very Weak', color: 'text-red-500' },
      1: { message: 'Weak', color: 'text-red-500' },
      2: { message: 'Fair', color: 'text-yellow-500' },
      3: { message: 'Good', color: 'text-blue-500' },
      4: { message: 'Strong', color: 'text-green-500' },
      5: { message: 'Very Strong', color: 'text-green-500' }
    };

    setPasswordStrength({
      score,
      message: strengthMap[score]?.message || '',
      color: strengthMap[score]?.color || ''
    });
  }, [passwordData.newPassword]);

  // Input Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('notifications.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: checked }
      }));
    } else if (name.startsWith('social.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social: { ...prev.social, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Handle WhatsApp IP input change
  const handleIPInputChange = (e) => {
    setIpAddress(e.target.value);
  };

  const handleDomainInputChange = (e) => {
  setDomainAddress(e.target.value);
};


  // Handle user details change for WhatsApp
  const handleUserDetailChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  // Action Triggers
  const handleSaveProfile = async () => {
    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    const result = await dispatch(changePassword({
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));

    if (changePassword.fulfilled.match(result)) {
      setIsEditingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  // WhatsApp IP Feature Handler
  const handleSendToWhatsApp = async () => {
    if (!ipAddress) {
      setWhatsAppStatus({
        type: "error",
        message: "Please enter an IP address"
      });
      return;
    }

    if (!userDetails.phone) {
      setWhatsAppStatus({
        type: "error",
        message: "Please enter your phone number"
      });
      return;
    }

    setIsSendingWhatsApp(true);
    setWhatsAppStatus({ type: "", message: "" });

    try {
      // Get current timestamp
      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long'
      });

      // Get device info from user agent
      const userAgent = navigator.userAgent;
      let browserInfo = "Unknown";
      let osInfo = "Unknown";
      
      if (userAgent.includes("Chrome")) browserInfo = "Chrome";
      else if (userAgent.includes("Firefox")) browserInfo = "Firefox";
      else if (userAgent.includes("Safari")) browserInfo = "Safari";
      else if (userAgent.includes("Edge")) browserInfo = "Edge";
      
      if (userAgent.includes("Windows")) osInfo = "Windows";
      else if (userAgent.includes("Mac")) osInfo = "macOS";
      else if (userAgent.includes("Linux")) osInfo = "Linux";
      else if (userAgent.includes("Android")) osInfo = "Android";
      else if (userAgent.includes("iOS")) osInfo = "iOS";

      // Construct WhatsApp message
      const message = `
🔍 *IP Address Details Report*
━━━━━━━━━━━━━━━━━━━━━

📋 *User Information*
👤 Name: ${userDetails.name || formData.name || 'Not provided'}
📧 Email: ${userDetails.email || formData.email || 'Not provided'}
📱 Phone: ${userDetails.phone || formData.phone || 'Not provided'}
🔑 Key: ${userDetails.key || formData.key || 'Not provided'}
   DOMAIN: ${domainAddress || 'Not provided'}

🌐 *IP Information*
📍 IP Address: ${ipAddress}
🌍 Location: ${userDetails.ipLocation || 'Fetching location...'}
💻 Device: ${osInfo}
🌐 Browser: ${browserInfo}
🆔 User Agent: ${userAgent.substring(0, 100)}...

📊 *Additional Info*
🏷️ Account Level: ${userStats.accountLevel}
💰 Balance: ₹${user?.balance?.toLocaleString() || 0}
🎮 Total GGR: ₹${user?.totalggr?.toLocaleString() || 0}
⭐ User ID: ${user?.prefix || 'c00'}-${user?._id?.slice(-6) || 'N/A'}

📅 *Timestamp*
⏰ Report Generated: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━
✅ This is an automated IP tracking report.
      `;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
    
      const whatsappUrl = `https://wa.me/${whatsappnumber}?text=${encodedMessage}`; 


      console.log("WhatsApp URL:", whatsappUrl);

      // For demonstration, we'll simulate an API call
      // In production, you might want to use a backe
      // nd service
      setTimeout(() => {
        setWhatsAppStatus({
          type: "success",
          message: "Message prepared! Click OK to open WhatsApp."
        });
        
        // Open WhatsApp with pre-filled message
        window.open(whatsappUrl, '_blank');
        
        setIsSendingWhatsApp(false);
        setShowIPInput(false);
        setIpAddress("");
      }, 1500);

    } catch (error) {
      console.error("WhatsApp send error:", error);
      setWhatsAppStatus({
        type: "error",
        message: "Failed to send message. Please try again."
      });
      setIsSendingWhatsApp(false);
    }
  };

  // Fetch IP location (optional)
  const fetchIPLocation = async () => {
    if (!ipAddress) return;
    
    try {
      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
      if (response.data.status === 'success') {
        setUserDetails(prev => ({
          ...prev,
          ipLocation: `${response.data.city}, ${response.data.regionName}, ${response.data.country}`
        }));
      }
    } catch (error) {
      console.error("IP location fetch error:", error);
    }
  };

  // Effect to fetch location when IP changes
  useEffect(() => {
    if (ipAddress && ipAddress.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
      fetchIPLocation();
    }
  }, [ipAddress]);

  // API Key handlers
  const handleVerifyKey = async (e) => {
    e.preventDefault();
    
    if (!keyPassword) {
      setKeyError("Please enter your password");
      return;
    }

    setIsVerifyingKey(true);
    setKeyError("");
    
    try {
      const result = await dispatch(verifyPassword({ password: keyPassword })).unwrap();
      console.log("result", result);
      
      if (result?.success) {
        setKeyVerified(true);
        setShowFullKey(true);
        setKeyPassword("");
        setIsVerifyingKey(false);
      } else {
        setKeyError(result?.message || "Invalid password");
        setIsVerifyingKey(false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setKeyError(error?.payload?.message || "Verification failed");
      setIsVerifyingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (user?.key) {
      navigator.clipboard.writeText(user.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleHideKey = () => {
    setShowFullKey(false);
    setKeyVerified(false);
    setKeyPassword("");
  };

  // Format API key (show last 4 characters or full)
  const getDisplayKey = () => {
    if (!user?.key) return "No API key available";

    if (showFullKey && keyVerified) {
      return user.key;
    }
    
    const keyLength = user.key.length;
    const maskedPart = "•".repeat(Math.max(0, keyLength - 4));
    const lastFour = user.key.slice(-4);
    return `${maskedPart}${lastFour}`;
  };

  const isKeyActive = user?.isActive === 1;

  // Theme colors
  const themeColors = {
    dark: {
      bg: '#0d1117',
      text: '#ffffff',
      secondaryText: '#cbd5e1',
      border: '#1e293b',
      hover: '#1e293b',
      primary: '#3b82f6',
      gradient: 'from-blue-600 to-indigo-600'
    },
    light: {
      bg: '#ffffff',
      text: '#1e293b',
      secondaryText: '#64748b',
      border: '#e2e8f0',
      hover: '#f1f5f9',
      primary: '#3b82f6',
      gradient: 'from-blue-600 to-indigo-600'
    }
  };

  const colors = themeColors[theme];

  // UI Styles
  const containerBg = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-black' 
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
  
  const cardBg = theme === 'dark' 
    ? 'bg-gray-800/40 backdrop-blur-xl border-gray-700/50' 
    : 'bg-white/80 backdrop-blur-xl border-gray-200/50';
  
  const borderColor = theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const inputBg = theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50';

  if (loading && !user) {
    return (
      <div className={`min-h-screen ${containerBg} flex items-center justify-center`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <GiGamepad className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerBg} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Gradient */}
        <div
          className={`relative overflow-hidden rounded-2xl 
            ${theme === "dark"
              ? "bg-[#111827] border border-gray-800"
              : "bg-white border border-gray-200"
            } p-6 md:p-8`}
        >
          {/* Background Patterns */}
          {theme === "dark" ? (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-purple-500/5 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-500/5 to-teal-500/5 rounded-full translate-y-48 -translate-x-48" />
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-100 to-teal-100 rounded-full translate-y-48 -translate-x-48" />
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* LEFT CONTENT */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                  <GiGamepad className="w-6 h-6 text-white" />
                </div>

                <h1
                  className={`text-2xl md:text-3xl font-bold 
                    ${theme === "dark"
                      ? "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    }`}
                >
                  Account Settings
                </h1>

                {user?.verified && (
                  <MdOutlineVerified className="w-6 h-6 text-blue-500" />
                )}
              </div>

              <p className={`${textSecondary} flex items-center gap-2`}>
                <FiActivity className="w-4 h-4" />
                Manage your profile, security, and preferences
              </p>
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 
                      bg-gradient-to-r from-green-500 to-emerald-500 text-white 
                      hover:shadow-lg hover:shadow-green-500/30 transition-all 
                      disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className={`p-3 rounded-xl border ${borderColor} ${textSecondary} 
                      hover:bg-red-500/10 hover:text-red-500 transition-all`}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-2
                    bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                    hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        

        {/* WhatsApp IP Feature Card */}
        <div className={`${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-6 lg:p-8
          bg-gradient-to-br from-green-600/5 to-emerald-600/5 relative overflow-hidden group
          hover:shadow-xl transition-all duration-500`}
        >
          {/* WhatsApp Icon Background */}
          <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaWhatsapp className="w-40 h-40 text-green-600" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center flex-col md:flex-row justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                  <FaWhatsapp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg md:text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                    IP Tracking via WhatsApp
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded-full">
                      New Feature
                    </span>
                  </h2>
                  <p className={`${textSecondary} text-sm mt-1`}>
                    Enter an IP address to get detailed user information sent directly to WhatsApp
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowIPInput(!showIPInput)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 
                  text-white flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/30 
                  transition-all group mt-5 md:mt-0"
              >
                <FiMessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {showIPInput ? "Close" : "Add your IP address and domain"}
              </button>
            </div>

            {/* IP Input Form */}
            {showIPInput && (
              <div className="mt-6 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* IP Address Input */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary} flex items-center gap-2`}>
                      <FiMapPin className="w-4 h-4" />
                      IP Address to Track
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={ipAddress}
                        onChange={handleIPInputChange}
                        placeholder="Enter IP address (e.g., 192.168.1.1 or 8.8.8.8)"
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-green-500 focus:ring-2 focus:ring-green-500/20
                          transition-all pl-12`}
                      />
                      <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    </div>
                    {ipAddress && ipAddress.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) && (
                      <p className="mt-2 text-xs text-green-500 flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        Valid IP address format
                      </p>
                    )}
                  </div>

                  

                  

                  {/* Location Preview (if available) */}
                  {userDetails.ipLocation && (
                    <div className="md:col-span-2">
                      <div className={`p-3 rounded-lg border ${borderColor} bg-green-500/5`}>
                        <p className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <FiMap className="w-4 h-4 text-green-500" />
                          Detected Location: <span className="text-green-500 font-medium">{userDetails.ipLocation}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary} flex items-center gap-2`}>
    <FiGlobe className="w-4 h-4" />
    Domain Name
  </label>

  <div className="relative">
    <input
      type="text"
      value={domainAddress}
      onChange={handleDomainInputChange}
      placeholder="example.com"
      className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
        ${inputBg} ${textPrimary} focus:border-green-500 focus:ring-2 focus:ring-green-500/20
        transition-all pl-12`}
    />
    <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
  </div>
  


  {domainAddress && !/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(domainAddress) && (
    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
      <FiAlertCircle className="w-3 h-3" />
      Invalid domain format
    </p>
  )}
</div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleSendToWhatsApp}
                    disabled={isSendingWhatsApp || !ipAddress || !userDetails.phone}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 
                      text-white font-medium hover:shadow-lg hover:shadow-green-500/30 
                      transition-all disabled:opacity-50 disabled:hover:shadow-none group flex items-center gap-2"
                  >
                    {isSendingWhatsApp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Send to WhatsApp
                      </>
                    )}
                  </button>


                  
                  
                  <button
                    onClick={() => {
                      setShowIPInput(false);
                      setIpAddress("");
                      setUserDetails(prev => ({
                        ...prev,
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone?.toString() || ""
                      }));
                      setWhatsAppStatus({ type: "", message: "" });
                    }}
                    className={`px-6 py-3 rounded-xl border ${borderColor} ${textSecondary} 
                      hover:bg-gray-800/20 transition-all`}
                  >
                    Cancel
                  </button>
                </div>

                {/* Status Message */}
                {whatsAppStatus.message && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    whatsAppStatus.type === "success" 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : "bg-red-500/10 border border-red-500/30"
                  }`}>
                    <p className={`text-sm flex items-center gap-2 ${
                      whatsAppStatus.type === "success" ? "text-green-500" : "text-red-500"
                    }`}>
                      {whatsAppStatus.type === "success" ? (
                        <FiCheckCircle className="w-4 h-4" />
                      ) : (
                        <FiAlertCircle className="w-4 h-4" />
                      )}
                      {whatsAppStatus.message}
                    </p>
                  </div>
                )}

                
              </div>
            )}

           







          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Security */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-6 lg:p-8
              hover:shadow-xl transition-all duration-500`}>
              
              {/* Avatar & Basic Info */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="relative">
                    <div className={`w-28 h-28 rounded-2xl overflow-hidden border-4 
                      ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} 
                      bg-gradient-to-br ${colors.gradient} p-1`}>
                      <div className="w-full h-full rounded-xl overflow-hidden bg-gray-900">
                        <img
                          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <button className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl 
                      bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center 
                      text-white shadow-lg hover:shadow-xl transition-all hover:scale-110
                      ${!isEditing && 'opacity-0 group-hover:opacity-100'}`}
                      disabled={!isEditing}>
                      <FiCamera className="w-5 h-5" />
                    </button>
                  </div>
                  {user?.verified && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 
                      flex items-center justify-center border-4 border-gray-900">
                      <FiCheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-3xl font-bold ${textPrimary}`}>
                      {formData.name || 'User'}
                    </h2>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full
                      bg-gradient-to-r ${colors.gradient} text-white`}>
                      {userStats.accountLevel}
                    </span>
                  </div>
                  
                  {/* Experience Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${textSecondary}`}>Level Progress</span>
                      <span className={`text-xs font-semibold ${textPrimary}`}>
                        {userStats.expPoints}/{userStats.nextLevel} XP
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${(userStats.expPoints / userStats.nextLevel) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className={`${textSecondary} flex items-center gap-2 text-sm`}>
                    <FiCalendar className="w-4 h-4" />
                    Member since {new Date(userStats.memberSince).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="group">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 
                      ${isEditing ? textSecondary : textMuted} flex items-center gap-2`}>
                      <FiUser className="w-4 h-4" />
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${textPrimary} transition-all duration-300
                          ${isEditing 
                            ? `${inputBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20` 
                            : 'bg-transparent cursor-default'
                          }`}
                      />
                      {isEditing && (
                        <FiEdit className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 
                      ${isEditing ? textSecondary : textMuted} flex items-center gap-2`}>
                      <FiMail className="w-4 h-4" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${textPrimary} transition-all duration-300
                          ${isEditing 
                            ? `${inputBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20` 
                            : 'bg-transparent cursor-default'
                          }`}
                      />
                      {user?.emailVerified && (
                        <FiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="group">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 
                      ${isEditing ? textSecondary : textMuted} flex items-center gap-2`}>
                      <FiSmartphone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${textPrimary} transition-all duration-300
                          ${isEditing 
                            ? `${inputBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20` 
                            : 'bg-transparent cursor-default'
                          }`}
                      />
                    </div>
                  </div>

                  {/* API Key Field - Enhanced Security */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 
                      ${textSecondary} flex items-center gap-2`}>
                      <FiKey className="w-4 h-4" />
                      API Key
                      {isKeyActive ? (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded-full flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-500 rounded-full flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </label>
                    
                    <div className={`p-4 rounded-xl border ${borderColor} ${inputBg}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className={`text-sm font-mono ${textPrimary}`}>
                              {getDisplayKey()}
                            </code>
                            
                            {showFullKey && keyVerified && (
                              <button
                                onClick={handleCopyKey}
                                className={`p-1.5 rounded-lg hover:bg-gray-700/30 transition-all group relative`}
                                title="Copy full key"
                              >
                                {copied ? (
                                  <FiCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                  <FiCopy className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                )}
                              </button>
                            )}
                          </div>
                          
                          {!showFullKey && user?.key && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last 4 characters shown. Verify password to view full key.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!showFullKey ? (
                            <button
                              onClick={() => setIsVerifyingKey(true)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-500 
                                hover:bg-blue-600/30 transition-all text-sm font-medium flex items-center gap-1"
                            >
                              <FiEye className="w-4 h-4" />
                              View Full Key
                            </button>
                          ) : (
                            <button
                              onClick={handleHideKey}
                              className="px-3 py-1.5 rounded-lg bg-gray-600/20 text-gray-400 
                                hover:bg-gray-600/30 transition-all text-sm font-medium flex items-center gap-1"
                            >
                              <FiEyeOff className="w-4 h-4" />
                              Hide
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Password Verification Modal */}
                      {isVerifyingKey && (
                        <div className="mt-4 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                          <p className={`text-sm font-medium mb-3 ${textPrimary} flex items-center gap-2`}>
                            <MdOutlineVpnKey className="w-4 h-4 text-blue-500" />
                            Enter your password to view full API key
                          </p>
                          
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="password"
                                value={keyPassword}
                                onChange={(e) => {
                                  setKeyPassword(e.target.value);
                                  setKeyError("");
                                }}
                                placeholder="Enter your password"
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} 
                                  ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                                onKeyPress={(e) => e.key === 'Enter' && handleVerifyKey()}
                              />
                            </div>
                            
                            <button
                              onClick={handleVerifyKey}
                              disabled={!isVerifyingKey || !keyPassword}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 
                                text-white text-sm font-medium hover:shadow-lg disabled:opacity-50 
                                disabled:hover:shadow-none transition-all flex items-center gap-2"
                            >
                              {!isVerifyingKey ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <FiCheckCircle className="w-4 h-4" />
                                  Verify
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => {
                                setIsVerifyingKey(false);
                                setKeyPassword("");
                                setKeyError("");
                              }}
                              className="p-2 rounded-lg border ${borderColor} text-gray-400 
                                hover:bg-gray-700/30 transition-all"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {keyError && (
                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                              <FiAlertCircle className="w-3 h-3" />
                              {keyError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 
                      ${isEditing ? textSecondary : textMuted} flex items-center gap-2`}>
                      <FiActivity className="w-4 h-4" />
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                        ${textPrimary} transition-all duration-300 resize-none
                        ${isEditing 
                          ? `${inputBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20` 
                          : 'bg-transparent cursor-default'
                        }`}
                    />
                  </div>
                </div>

                {/* Social Links */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-700/30">
                    <h3 className={`text-lg font-semibold mb-4 ${textPrimary} flex items-center gap-2`}>
                      <FiGlobe className="w-5 h-5" />
                      Social Profiles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="social.twitter"
                        value={formData.social.twitter}
                        onChange={handleInputChange}
                        placeholder="Twitter handle"
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      />
                      <input
                        type="text"
                        name="social.discord"
                        value={formData.social.discord}
                        onChange={handleInputChange}
                        placeholder="Discord username"
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      />
                      <input
                        type="text"
                        name="social.steam"
                        value={formData.social.steam}
                        onChange={handleInputChange}
                        placeholder="Steam ID"
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Card */}
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-6 lg:p-8
              hover:shadow-xl transition-all duration-500`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                  <MdOutlineSecurity className="w-6 h-6 text-blue-500" />
                  Security Settings
                </h3>
                {!isEditingPassword && (
                  <button 
                    onClick={() => setIsEditingPassword(true)} 
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 
                      text-blue-500 flex items-center gap-2 hover:from-blue-600/30 hover:to-indigo-600/30 
                      transition-all group"
                  >
                    <FiLock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Change Password
                  </button>
                )}
              </div>
              
              {isEditingPassword ? (
                <div className="space-y-5">
                  {/* Current Password */}
                  <div className="relative">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength.score
                                  ? passwordStrength.score <= 2
                                    ? 'bg-red-500'
                                    : passwordStrength.score === 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${passwordStrength.color} font-medium`}>
                          Password Strength: {passwordStrength.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border ${borderColor} 
                          ${inputBg} ${textPrimary} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSavePassword}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 
                        text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 
                        transition-all disabled:opacity-50 disabled:hover:shadow-none group"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      className={`px-6 py-3 rounded-xl border ${borderColor} ${textSecondary} 
                        hover:bg-gray-800/20 transition-all`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <FiShield className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>Password last changed</p>
                    <p className={`text-xs ${textSecondary}`}>
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'} • Strong password
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Preferences */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-6 lg:p-8
              bg-gradient-to-br from-blue-600/5 to-indigo-600/5`}>
              <h3 className={`text-lg font-bold mb-6 ${textPrimary} flex items-center gap-2`}>
                <GiAchievement className="w-5 h-5 text-yellow-500" />
                Gaming Stats
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                      <GiWallet className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Balance</p>
                      <p className={`text-xl font-bold ${textPrimary}`}>₹ {user?.balance?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-500">Active</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <GiGamepad className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Total GGR</p>
                      <p className={`text-xl font-bold ${textPrimary}`}>₹ {user?.totalggr?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-500">+{user?.todayggr || 0} today</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                      <FiStar className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Achievements</p>
                      <p className={`text-xl font-bold ${textPrimary}`}>{userStats.achievements}</p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-500">{Math.floor((userStats.achievements / 200) * 100)}%</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <FiActivity className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Cricket Balance</p>
                      <p className={`text-xl font-bold ${textPrimary}`}>₹ {user?.cricketBalence?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-6`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                  <FiHelpCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${textPrimary}`}>Need help?</h4>
                  <p className={`text-xs ${textSecondary} mt-1`}>
                    Contact our support team for assistance
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium hover:shadow-lg transition-all">
                  Contact
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-6`}>
              <h4 className={`text-sm font-semibold mb-3 ${textPrimary}`}>Account Details</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className={textSecondary}>User ID:</span>
                  <span className={`${textPrimary} font-mono`}>{user?.prefix || 'c00'}-{user?._id?.slice(-6) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textSecondary}>Account Type:</span>
                  <span className={`${textPrimary} capitalize`}>{user?.role || 'user'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textSecondary}>IP Address:</span>
                  <span>

                   {user?.ipv4_address.map((ip)=>(
                      <p>{ip}</p>
                    )) }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={textSecondary}>Demo Account:</span>
                  <span className={`${user?.isdemo ? 'text-yellow-500' : 'text-green-500'}`}>
                    {user?.isdemo ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={textSecondary}>Last Active:</span>
                  <span className={textPrimary}>
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserAccount;