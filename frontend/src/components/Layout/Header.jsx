import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineLogout,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { RxPerson } from "react-icons/rx";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import { RxCross1 } from "react-icons/rx";
import SafeImage from "../common/SafeImage";
import { UserAvatar, ProductImage } from "../common/EnhancedImage";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { logoutUser } from "../../redux/actions/user";
import { toast } from "react-toastify";

const Header = ({ activeHeading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSeller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [showUserDropdown, setShowUserDropdown] = useState(false); // user dropdown

  // Handle search change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter products
    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    setSearchData(filteredProducts);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast.success("Logout successful!");
      navigate("/login");
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      setActive(true);
    } else {
      setActive(false);
    }
  });

  return (
    <>
      <div className={`${styles.section}`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between ">
          <div>
            <Link to="/">
              <div className="flex items-center">
                <SafeImage
                  src="/main.png"
                  alt="Bhavya Vyapar"
                  className="h-[40px]"
                  fallbackType="brand"
                />
                <span className="font-bold ml-2 text-xl">Bhavya Vyapar</span>
              </div>
            </Link>
          </div>
          {/*Search box  */}
          <div className="w-[50%] relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-[44px] w-full pl-4 pr-12 border-2 border-gray-200 rounded-xl 
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                          transition-all duration-300 outline-none
                          bg-white shadow-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-blue-50 rounded-lg"
              >
                <AiOutlineSearch size={20} className="text-gray-500" />
              </Button>
            </div>
            {
              // Search data if length is not 0 then show
              searchData && searchData.length !== 0 ? (
                <div className="absolute w-full min-h-[30vh] bg-white shadow-xl rounded-xl border border-gray-100 z-[9] p-2 mt-2 max-h-96 overflow-y-auto">
                  {searchData &&
                    searchData.map((i, index) => {
                      return (
                        <Link to={`/product/${i._id}`} key={index}>
                          <div className="w-full flex items-center py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <ProductImage
                              product={i}
                              className="w-[50px] h-[50px] mr-4 rounded-lg object-cover border border-gray-200"
                              alt="Product image"
                            />
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                {i.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-blue-600">
                                  ₹{(i.discountPrice || i.originalPrice)?.toLocaleString()}
                                </span>
                                {i.shop?.name && (
                                  <span className="text-xs text-gray-500">
                                    by {i.shop.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              ) : null
            }
          </div>
          {/* Search end */}

          {/* Become a Seller */}
          <div>
            {isAuthenticated ? (
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <Button
                  variant="primary"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  <span className="flex items-center text-white">
                    {isSeller ? "Go Dashboard" : "Become Seller"}
                    <IoIosArrowForward className="ml-2" size={16} />
                  </span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  className="px-6 py-2.5 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <span className="flex items-center">
                    Login to Become Seller
                    <IoIosArrowForward className="ml-2" size={16} />
                  </span>
                </Button>
              </Link>
            )}
          </div>
          {/* Become a Seller end */}
        </div>
      </div>

      {/*  2nd part of header start */}
      <div
        className={`${
          active === true ? "shadow-lg fixed top-0 left-0 z-10" : null
        } transition hidden 800px:flex items-center justify-between w-full bg-gradient-to-r from-blue-600 to-blue-700 h-[70px]`}
      >
        <div
          className={`${styles.section} relative ${styles.noramlFlex} justify-between`}
        >
          {/* Categories */}
          <div onClick={() => setDropDown(!dropDown)}>
            <div className="relative h-[60px] mt-[10px] w-[270px] hidden 1000px:block">
              <BiMenuAltLeft size={30} className="absolute top-3 left-2" />
              <button
                className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white font-sans text-lg font-[500] select-none rounded-t-md`}
              >
                All Categories
              </button>
              <IoIosArrowDown
                size={20}
                className="absolute right-2 top-4 cursor-pointer"
                onClick={() => setDropDown(!dropDown)}
              />
              {dropDown ? (
                <DropDown
                  categoriesData={categoriesData}
                  setDropDown={setDropDown}
                />
              ) : null}
            </div>
          </div>

          {/* NavItems */}
          <div className={`${styles.noramlFlex}`}>
            <Navbar active={activeHeading} />
          </div>

          <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Button
              variant="ghost"
              onClick={() => setOpenWishlist(true)}
              className="relative p-3 hover:bg-white/10 rounded-full transition-colors duration-300"
            >
              <AiOutlineHeart size={24} className="text-white" />
              {wishlist && wishlist.length > 0 && (
                <Badge
                  variant="error"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs animate-pulse"
                >
                  {wishlist.length}
                </Badge>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              onClick={() => setOpenCart(true)}
              className="relative p-3 hover:bg-white/10 rounded-full transition-colors duration-300"
            >
              <AiOutlineShoppingCart size={24} className="text-white" />
              {cart && cart.length > 0 && (
                <Badge
                  variant="success"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs animate-pulse"
                >
                  {cart.length}
                </Badge>
              )}
            </Button>

            {/* User Avatar */}
            <div className="relative user-dropdown">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center focus:outline-none"
                  >
                    <UserAvatar
                      user={user}
                      className="w-10 h-10 rounded-full border-2 border-white/30 hover:border-white/60 transition-colors duration-300"
                      alt="User avatar"
                    />
                    <IoIosArrowDown 
                      className={`ml-2 text-white transition-transform duration-200 ${
                        showUserDropdown ? 'rotate-180' : ''
                      }`} 
                      size={16} 
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user?.email || user?.phoneNumber || ''}
                        </p>
                      </div>
                      
                      <Link 
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <RxPerson className="mr-3" size={16} />
                        Profile
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <AiOutlineLogout className="mr-3" size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="p-3 hover:bg-white/10 rounded-full transition-colors duration-300"
                  >
                    <CgProfile size={24} className="text-white" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Cart Popup */}
            {openCart && <Cart setOpenCart={setOpenCart} />}
            {/* Wishlist Popup */}
            {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        }
            w-full h-[60px] bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between">
          <div>
            <BiMenuAltLeft
              size={40}
              className="ml-4"
              onClick={() => setOpen(true)}
            />
          </div>
          <div>
            <Link to="/">
              <div className="flex items-center">
                <SafeImage
                  src="/main.png"
                  alt="Bhavya Vyapar"
                  className="h-[40px] mt-3 cursor-pointer"
                  fallbackType="general"
                />
                <span className="font-bold ml-2 text-lg">Bhavya Vyapar</span>
              </div>
            </Link>
          </div>

          <div>
            <div
              className="relative mr-[20px]"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={30} />
              <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                {cart && cart.length}
              </span>
            </div>
          </div>
          {/* cart popup */}
          {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

          {/* wishlist popup */}
          {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
        </div>
      </div>

      {/*  side bar*/}
      {open ? (
        <div className={`fixed w-full bg-[#0000005f] z-20 h-full top-0 left-0`}>
          <div className="fixed w-[70%] bg-[#fff] h-screen top-0 left-0 z-10 overflow-y-scroll">
            <div className="w-full justify-between flex pr-3">
              <div>
                <div
                  className="relative mr-[15px]"
                  onClick={() => setOpenWishlist(true) || setOpen(false)}
                >
                  <AiOutlineHeart size={30} className="mt-5 ml-3" />
                  <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                    {wishlist && wishlist.length}
                  </span>
                </div>
              </div>

              <RxCross1
                size={30}
                className="ml-4 mt-5 cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Search Bar */}
            <div className="my-8 w-[92%] m-auto h-[40px relative]">
              <input
                type="search"
                placeholder="Search for products"
                className="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
                value={searchTerm}
                onChange={handleSearchChange}
              />

              {searchData && (
                <div className="absolute bg-[#fff] z-10 shadow w-full left-0 p-3">
                  {searchData.map((i) => {
                    return (
                      <Link to={`/product/${i._id}`} key={i._id}>
                        <div className="flex items-center">
                          <ProductImage
                            product={i}
                            className="w-[50px] mr-2"
                            alt="Product image"
                          />
                          <h5>{i.name}</h5>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <Navbar active={activeHeading} />
            <div className={`${styles.button} ml-4 !rounded-[4px]`}>
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <h1 className="text-[#fff] flex items-center">
                  {isSeller ? "Go Dashboard" : "Become Seller"}{" "}
                  <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            {/* Mob Login */}
            <div className="flex w-full justify-center">
              {isAuthenticated ? (
                <div className="flex flex-col items-center space-y-3 px-4 py-2">
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    <UserAvatar
                      user={user}
                      className="w-[60px] h-[60px] rounded-full border-[3px] border-[#0eae88]"
                      alt="Profile img"
                    />
                  </Link>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || user?.phoneNumber || ''}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    <AiOutlineLogout className="mr-2" size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-[18px] pr-[10px] text-[#000000b7]"
                  >
                    Login{" "}
                  </Link>
                  <Link to="/sign-up" className="text-[18px] text-[#000000b7]">
                    Sign up{" "}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Header;
