// Modern UI styles with improved design system
const modernStyles = {
  // Layout & Container Styles
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  gridContainer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  
  // Typography
  heading1: "text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight",
  heading2: "text-3xl md:text-4xl font-bold text-gray-900 leading-tight",
  heading3: "text-2xl md:text-3xl font-semibold text-gray-900 leading-tight",
  heading4: "text-xl md:text-2xl font-semibold text-gray-800",
  heading5: "text-lg md:text-xl font-semibold text-gray-800",
  heading6: "text-base md:text-lg font-semibold text-gray-700",
  
  bodyLarge: "text-lg text-gray-700 leading-relaxed",
  bodyMedium: "text-base text-gray-600 leading-relaxed",
  bodySmall: "text-sm text-gray-500",
  caption: "text-xs text-gray-400 uppercase tracking-wide",
  
  // Button Styles
  btnPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl",
  btnSecondary: "bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-all duration-200",
  btnOutline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200",
  btnSuccess: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg",
  btnDanger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg",
  btnWarning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg",
  btnIcon: "p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200",
  
  // Card Styles
  card: "bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100",
  cardHeader: "p-6 border-b border-gray-100",
  cardBody: "p-6",
  cardFooter: "p-6 bg-gray-50 rounded-b-xl",
  
  // Form Styles
  formGroup: "mb-6",
  label: "block text-sm font-semibold text-gray-700 mb-2",
  input: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white",
  inputError: "w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-red-50",
  inputSuccess: "w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-green-50",
  textarea: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical min-h-[120px]",
  select: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white",
  
  // Navigation Styles
  navbar: "bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50",
  navItem: "px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium",
  navItemActive: "px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-semibold",
  
  // Product Styles
  productCard: "bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group overflow-hidden",
  productImage: "w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300",
  productTitle: "text-lg font-semibold text-gray-900 mb-2 line-clamp-2",
  productPrice: "text-2xl font-bold text-blue-600",
  productOriginalPrice: "text-lg text-gray-500 line-through ml-2",
  productDiscount: "bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold",
  productRating: "flex items-center space-x-1 text-yellow-500",
  
  // Badge & Tag Styles
  badge: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
  badgePrimary: "bg-blue-100 text-blue-800",
  badgeSuccess: "bg-green-100 text-green-800",
  badgeWarning: "bg-yellow-100 text-yellow-800",
  badgeDanger: "bg-red-100 text-red-800",
  badgeInfo: "bg-indigo-100 text-indigo-800",
  
  // Animation & Transition Styles
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  
  // Shadow Styles
  shadowSm: "shadow-sm",
  shadow: "shadow-lg",
  shadowLg: "shadow-xl",
  shadowXl: "shadow-2xl",
  
  // Spacing Styles
  spacingXs: "space-y-2",
  spacingSm: "space-y-4",
  spacingMd: "space-y-6",
  spacingLg: "space-y-8",
  spacingXl: "space-y-12",
  
  // Loading Styles
  spinner: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600",
  skeleton: "animate-pulse bg-gray-300 rounded",
  
  // Status Styles
  statusOnline: "w-3 h-3 bg-green-500 rounded-full",
  statusOffline: "w-3 h-3 bg-gray-400 rounded-full",
  statusBusy: "w-3 h-3 bg-red-500 rounded-full",
  statusAway: "w-3 h-3 bg-yellow-500 rounded-full",
  
  // Alert Styles
  alertSuccess: "bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg",
  alertError: "bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg",
  alertWarning: "bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg",
  alertInfo: "bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg",
  
  // Search Styles
  searchContainer: "relative flex-1 max-w-2xl",
  searchInput: "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white",
  searchIcon: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400",
  searchResults: "absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto mt-1",
  
  // Modal Styles
  modalOverlay: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
  modalContainer: "bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300",
  modalHeader: "px-6 py-4 border-b border-gray-200",
  modalBody: "px-6 py-4",
  modalFooter: "px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3",
  
  // Responsive Utilities
  hiddenMobile: "hidden md:block",
  hiddenDesktop: "block md:hidden",
  textResponsive: "text-sm md:text-base lg:text-lg",
  paddingResponsive: "px-4 md:px-6 lg:px-8",
  marginResponsive: "mx-4 md:mx-6 lg:mx-8",
};

export default modernStyles;
