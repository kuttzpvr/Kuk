import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  LogOut,
  LogIn,
  ChevronRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  Plus,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Trash2,
  Star,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Heart,
  ShoppingBag,
  Edit3,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ShopifyCustomerAddress } from '../../types';
import { MyOrdersView } from '../orders/MyOrdersView';

type AuthViewMode = 'login' | 'register' | 'forgot_password';
type DashboardTab = 'orders' | 'wishlist' | 'addresses' | 'details';

export const AccountView: React.FC = () => {
  const {
    customer,
    isCustomerLoading,
    customerError,
    clearCustomerError,
    loginCustomer,
    registerCustomer,
    recoverCustomerPassword,
    logoutCustomer,
    addCustomerAddress,
    updateCustomerAddress,
    setDefaultAddress,
    deleteCustomerAddress,
    customerOrders,
    orders,
    wishlist,
    products,
    removeFromWishlist,
    moveWishlistItemToCart,
    openProductDetail,
    setActiveTab: setRootActiveTab,
    setCurrentScreen,
    setIsAdminModalOpen,
    setIsFlutterModalOpen,
  } = useShop();

  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('orders');
  const [authMode, setAuthMode] = useState<AuthViewMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Forgot Password Form State
  const [recoverEmail, setRecoverEmail] = useState('');

  // Add Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addrFirstName, setAddrFirstName] = useState('');
  const [addrLastName, setAddrLastName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Maharashtra');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');

  // Edit Address Modal State
  const [editingAddress, setEditingAddress] = useState<ShopifyCustomerAddress | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editLine1, setEditLine1] = useState('');
  const [editLine2, setEditLine2] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('Maharashtra');
  const [editZip, setEditZip] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsDefault, setEditIsDefault] = useState(false);

  // Moving Wishlist Item State
  const [movingWishlistId, setMovingWishlistId] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsSubmitting(true);
    setAuthSuccessMsg(null);
    try {
      await loginCustomer(loginEmail, loginPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regEmail || !regPassword) return;
    setIsSubmitting(true);
    setAuthSuccessMsg(null);
    clearCustomerError();
    try {
      const res = await registerCustomer({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
      });
      if (res.success) {
        setAuthMode('login');
        setLoginEmail(regEmail);
        if (res.requiresVerification) {
          setAuthSuccessMsg(
            res.message || `We have sent an email to ${regEmail}, please click the link included to verify your email address.`
          );
        } else {
          setAuthSuccessMsg('Account created successfully! Please sign in with your credentials.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail) return;
    setIsSubmitting(true);
    try {
      const msg = await recoverCustomerPassword(recoverEmail);
      setAuthSuccessMsg(msg || 'A password reset email has been sent to your address.');
    } catch (err: any) {
      // Handled via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine1 || !addrCity || !addrZip) return;
    setIsSubmitting(true);
    try {
      const ok = await addCustomerAddress({
        firstName: addrFirstName,
        lastName: addrLastName,
        address1: addrLine1,
        address2: addrLine2,
        city: addrCity,
        province: addrState,
        zip: addrZip,
        phone: addrPhone,
        country: 'India',
      });
      if (ok) {
        setIsAddAddressOpen(false);
        setAddrFirstName('');
        setAddrLastName('');
        setAddrLine1('');
        setAddrLine2('');
        setAddrCity('');
        setAddrZip('');
        setAddrPhone('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditAddress = (addr: ShopifyCustomerAddress) => {
    setEditingAddress(addr);
    setEditFirstName(addr.firstName || '');
    setEditLastName(addr.lastName || '');
    setEditLine1(addr.address1 || '');
    setEditLine2(addr.address2 || '');
    setEditCity(addr.city || '');
    setEditState(addr.province || 'Maharashtra');
    setEditZip(addr.zip || '');
    setEditPhone(addr.phone || '');
    setEditIsDefault(Boolean(addr.isDefault));
  };

  const handleUpdateAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress || !editLine1 || !editCity || !editZip) return;
    setIsSubmitting(true);
    try {
      const ok = await updateCustomerAddress(editingAddress.id, {
        firstName: editFirstName,
        lastName: editLastName,
        address1: editLine1,
        address2: editLine2,
        city: editCity,
        province: editState,
        zip: editZip,
        phone: editPhone,
        isDefault: editIsDefault,
        country: 'India',
      });
      if (ok) {
        setEditingAddress(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATION VIEW (Guest / Not Signed In)
  // --------------------------------------------------------------------------
  if (!customer) {
    return (
      <div className="flex flex-col gap-4 px-3.5 pt-3 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-200">
        {/* Banner Brand Card */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-heading font-black text-2xl shadow-md">
            K
          </div>
          <h1 className="font-heading font-black text-xl text-zinc-950 tracking-tight">
            KUKAPI Account
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            Directly connected to Shopify Storefront API. Manage orders, track deliveries, and store your express shipping addresses.
          </p>

          {/* Quick tab switcher for login/register */}
          <div className="flex bg-zinc-100 p-1 rounded-2xl w-full max-w-xs mt-3 text-xs font-bold">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthSuccessMsg(null);
                clearCustomerError();
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthSuccessMsg(null);
                clearCustomerError();
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Success / Info Feedback Banner */}
        {authSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-950">
                  {authSuccessMsg.includes('verify') || authSuccessMsg.includes('sent an email')
                    ? 'Verification Email Dispatched'
                    : 'Account Notice'}
                </p>
                <p className="mt-0.5 leading-relaxed text-emerald-800">{authSuccessMsg}</p>
              </div>
            </div>
            {(authSuccessMsg.includes('verify') || authSuccessMsg.includes('sent an email')) && (
              <div className="bg-white/80 rounded-xl p-2.5 text-[11px] text-zinc-700 border border-emerald-100 flex flex-col gap-1">
                <span className="font-semibold text-zinc-900">Next steps:</span>
                <span>1. Open your email inbox (and spam/promotions folder if needed).</span>
                <span>2. Click the verification link from KUKAPI / Shopify to activate your account.</span>
                <span>3. Enter your password below to sign in.</span>
              </div>
            )}
          </div>
        )}

        {/* Error Feedback Banner */}
        {customerError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Authentication Notice: </span>
              <span>{customerError}</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
          {/* 1. SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-extrabold text-sm text-zinc-950">
                  Welcome Back
                </h2>
                <p className="text-zinc-500 text-[11px]">
                  Sign in with your Shopify registered email & password.
                </p>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-zinc-700 block">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setAuthSuccessMsg(null);
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-950 underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCustomerLoading}
                className="w-full mt-2 py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-zinc-500">
                New to KUKAPI?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthSuccessMsg(null);
                  }}
                  className="font-bold text-zinc-950 underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* 2. CREATE ACCOUNT FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-extrabold text-sm text-zinc-950">
                  Create KUKAPI Account
                </h2>
                <p className="text-zinc-500 text-[11px]">
                  Join the KUKAPI streetwear collective. Saved addresses & live order tracking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="e.g. Singhania"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-9 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCustomerLoading}
                className="w-full mt-2 py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-zinc-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthSuccessMsg(null);
                  }}
                  className="font-bold text-zinc-950 underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleRecoverSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading font-extrabold text-sm text-zinc-950">
                  Reset Password
                </h2>
                <p className="text-zinc-500 text-[11px]">
                  Enter your email and Shopify will send you a secure link to reset your password.
                </p>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthSuccessMsg(null);
                  clearCustomerError();
                }}
                className="text-center text-xs font-bold text-zinc-600 hover:text-zinc-950 py-1"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Guest Recent Orders preview */}
        {orders.length > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-900">Guest Placed Orders ({orders.length})</span>
            <p className="text-[11px] text-zinc-500">
              Orders placed in this browser session. Sign in to link them to your customer profile.
            </p>
            <MyOrdersView />
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LOGGED IN CUSTOMER DASHBOARD
  // --------------------------------------------------------------------------
  const displayName =
    customer.displayName ||
    `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
    'KUKAPI Collector';

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveWishlistToCart = async (product: any) => {
    setMovingWishlistId(product.id);
    try {
      const variant = product.variants?.[0];
      if (variant) {
        await moveWishlistItemToCart(product, variant);
      }
    } finally {
      setMovingWishlistId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-3 pb-24 max-w-xl mx-auto w-full animate-in fade-in duration-200">
      {/* Customer Header Card */}
      <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-black font-heading text-xl shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading font-extrabold text-base text-zinc-950">
                Welcome, {displayName}
              </h1>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Shopify Verified
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-zinc-400" />
              <span>{customer.email}</span>
            </p>
            {customer.phone && (
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-zinc-400" />
                <span>{customer.phone}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={logoutCustomer}
          className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 border border-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5"
          title="Log out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs: Orders | Wishlist | Addresses | Details */}
      <div className="grid grid-cols-4 bg-zinc-200/70 p-1 rounded-2xl text-xs font-bold gap-1">
        <button
          onClick={() => setDashboardTab('orders')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
            dashboardTab === 'orders'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Orders ({customerOrders.length || orders.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('wishlist')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
            dashboardTab === 'wishlist'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Heart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('addresses')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
            dashboardTab === 'addresses'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Addresses ({customer.addresses?.length || 0})</span>
        </button>

        <button
          onClick={() => setDashboardTab('details')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
            dashboardTab === 'details'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Details</span>
        </button>
      </div>

      {/* 1. TAB CONTENT: ORDERS */}
      {dashboardTab === 'orders' && <MyOrdersView />}

      {/* 2. TAB CONTENT: WISHLIST */}
      {dashboardTab === 'wishlist' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Saved Streetwear Wishlist ({wishlistedProducts.length})</span>
            </span>
            <span className="text-[11px] text-zinc-500">Synced to Shopify Profile</span>
          </div>

          {wishlistedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishlistedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex gap-3 group"
                >
                  <div
                    onClick={() => openProductDetail(prod)}
                    className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0 cursor-pointer"
                  >
                    <img
                      src={prod.featuredImage}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4
                        onClick={() => openProductDetail(prod)}
                        className="font-heading font-bold text-xs text-zinc-900 line-clamp-1 cursor-pointer hover:underline"
                      >
                        {prod.title}
                      </h4>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-heading font-black text-sm text-zinc-950">
                          ₹{prod.price}
                        </span>
                        {prod.compareAtPrice > prod.price && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            ₹{prod.compareAtPrice}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            prod.availableForSale
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              prod.availableForSale ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {prod.availableForSale ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleMoveWishlistToCart(prod)}
                        disabled={movingWishlistId === prod.id || !prod.availableForSale}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-zinc-950 text-white text-[10px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-60 shadow-2xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>{movingWishlistId === prod.id ? 'Moving...' : 'Move to Bag'}</span>
                      </button>

                      <button
                        onClick={() => removeFromWishlist(prod.id)}
                        className="p-1.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-xs flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-zinc-950">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                Tap the heart icon on any KUKAPI oversized tee or silhouette to save it to your wishlist.
              </p>
              <button
                onClick={() => {
                  setRootActiveTab('shop');
                  setCurrentScreen('main');
                }}
                className="mt-2 px-4 py-2 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all"
              >
                Explore Drops
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: ADDRESSES */}
      {dashboardTab === 'addresses' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-zinc-950 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-700" />
                <span>Saved Delivery Addresses ({customer.addresses?.length || 0})</span>
              </h2>
              <button
                onClick={() => setIsAddAddressOpen(true)}
                className="text-xs font-bold text-zinc-950 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New</span>
              </button>
            </div>

            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">
                          {addr.name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim()}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-zinc-950 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] font-bold text-zinc-600 hover:text-zinc-950 underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                          title="Edit address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCustomerAddress(addr.id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-zinc-700 font-medium">{addr.address1}</p>
                    {addr.address2 && <p className="text-zinc-600">{addr.address2}</p>}
                    <p className="text-zinc-500">
                      {addr.city}
                      {addr.province ? `, ${addr.province}` : ''} - {addr.zip}
                    </p>
                    {addr.phone && <p className="text-zinc-400">Phone: {addr.phone}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 py-6 text-center flex flex-col items-center gap-2">
                <MapPin className="w-8 h-8 text-zinc-300" />
                <p>No saved addresses yet. Add one to enable one-tap checkout.</p>
                <button
                  onClick={() => setIsAddAddressOpen(true)}
                  className="px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-bold mt-1"
                >
                  Add Delivery Address
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: ACCOUNT DETAILS */}
      {dashboardTab === 'details' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-3">
            <h2 className="font-heading font-extrabold text-sm text-zinc-950 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-700" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Full Name
                </span>
                <span className="font-bold text-zinc-900">{displayName}</span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Email
                </span>
                <span className="font-bold text-zinc-900 break-all">{customer.email}</span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Mobile Number
                </span>
                <span className="font-bold text-zinc-900">
                  {customer.phone || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Orders Count
                </span>
                <span className="font-bold text-zinc-900">
                  {customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings & Help Menu */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden divide-y divide-zinc-100 text-xs">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-zinc-700" />
                <span className="font-semibold text-zinc-900">Admin COD & Store Configuration</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => setIsFlutterModalOpen(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-zinc-700" />
                <span className="font-semibold text-zinc-900">Flutter Clean Architecture Code</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <div className="p-3.5 flex items-center justify-between text-zinc-600">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-zinc-700" />
                <span className="font-semibold text-zinc-900">Customer Concierge</span>
              </div>
              <span className="font-bold text-zinc-900">support@kukapi.com</span>
            </div>
          </div>

          {/* Full Logout Row */}
          <button
            onClick={logoutCustomer}
            className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border border-zinc-200 hover:border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of KUKAPI Account</span>
          </button>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-zinc-950">
                Add Saved Address
              </h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddressSubmit} className="flex flex-col gap-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={addrFirstName}
                  onChange={(e) => setAddrFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  value={addrLastName}
                  onChange={(e) => setAddrLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
              </div>

              <input
                type="text"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                placeholder="House / Flat / Street (Address Line 1) *"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                required
              />

              <input
                type="text"
                value={addrLine2}
                onChange={(e) => setAddrLine2(e.target.value)}
                placeholder="Apartment / Landmark (Optional)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City *"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                  required
                />
                <input
                  type="text"
                  value={addrZip}
                  onChange={(e) => setAddrZip(e.target.value)}
                  placeholder="PIN Code *"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="State"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="Mobile Phone"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-950 text-white font-bold disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save to Shopify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-zinc-950">
                Edit Delivery Address
              </h3>
              <button
                onClick={() => setEditingAddress(null)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateAddressSubmit} className="flex flex-col gap-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
              </div>

              <input
                type="text"
                value={editLine1}
                onChange={(e) => setEditLine1(e.target.value)}
                placeholder="House / Flat / Street (Address Line 1) *"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                required
              />

              <input
                type="text"
                value={editLine2}
                onChange={(e) => setEditLine2(e.target.value)}
                placeholder="Apartment / Landmark (Optional)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="City *"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                  required
                />
                <input
                  type="text"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                  placeholder="PIN Code *"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  placeholder="State"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Mobile Phone"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsDefault}
                  onChange={(e) => setEditIsDefault(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                />
                <span className="text-zinc-700 font-medium">Set as default delivery address</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-950 text-white font-bold disabled:opacity-60"
                >
                  {isSubmitting ? 'Updating...' : 'Update Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
