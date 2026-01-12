import { useRoutes } from "react-router-dom";

// Pages
import DashboardOverview1 from "../pages/DashboardOverview1";
import Categories from "../pages/Categories";
import AddProduct from "../pages/AddProduct";
import ProductList from "../pages/ProductList";
import ProductGrid from "../pages/ProductGrid";
import TransactionList from "../pages/TransactionList";
import TransactionDetail from "../pages/TransactionDetail";
import SellerList from "../pages/SellerList";
import SellerDetail from "../pages/SellerDetail";
import Reviews from "../pages/Reviews";
import Inbox from "../pages/Inbox";
import FileManager from "../pages/FileManager";
import PointOfSale from "../pages/PointOfSale";
import Chat from "../pages/Chat";
import Post from "../pages/Post";
import Calendar from "../pages/Calendar";
import CrudDataList from "../pages/CrudDataList";
import CrudForm from "../pages/CrudForm";
import UsersLayout1 from "../pages/UsersLayout1";
import UsersLayout2 from "../pages/UsersLayout2";
import UsersLayout3 from "../pages/UsersLayout3";
import ProfileOverview1 from "../pages/ProfileOverview1";
import ProfileOverview2 from "../pages/ProfileOverview2";
import ProfileOverview3 from "../pages/ProfileOverview3";
import WizardLayout1 from "../pages/WizardLayout1";
import WizardLayout2 from "../pages/WizardLayout2";
import WizardLayout3 from "../pages/WizardLayout3";
import BlogLayout1 from "../pages/BlogLayout1";
import BlogLayout2 from "../pages/BlogLayout2";
import BlogLayout3 from "../pages/BlogLayout3";
import PricingLayout1 from "../pages/PricingLayout1";
import PricingLayout2 from "../pages/PricingLayout2";
import InvoiceLayout1 from "../pages/InvoiceLayout1";
import InvoiceLayout2 from "../pages/InvoiceLayout2";
import FaqLayout1 from "../pages/FaqLayout1";
import FaqLayout2 from "../pages/FaqLayout2";
import FaqLayout3 from "../pages/FaqLayout3";
import Register from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";
import UpdateProfile from "../pages/UpdateProfile";
import RegularTable from "../pages/RegularTable";
import Tabulator from "../pages/Tabulator";
import Modal from "../pages/Modal";
import Slideover from "../pages/Slideover";
import Notification from "../pages/Notification";
import Tab from "../pages/Tab";
import Accordion from "../pages/Accordion";
import Button from "../pages/Button";
import Alert from "../pages/Alert";
import ProgressBar from "../pages/ProgressBar";
import Tooltip from "../pages/Tooltip";
import Dropdown from "../pages/Dropdown";
import Typography from "../pages/Typography";
import Icon from "../pages/Icon";
import LoadingIcon from "../pages/LoadingIcon";
import RegularForm from "../pages/RegularForm";
import Datepicker from "../pages/Datepicker";
import TomSelect from "../pages/TomSelect";
import FileUpload from "../pages/FileUpload";
import WysiwygEditor from "../pages/WysiwygEditor";
import Validation from "../pages/Validation";
import Chart from "../pages/Chart";
import Slider from "../pages/Slider";
import ImageZoom from "../pages/ImageZoom";

// Ecommerce Admin
import Layout from "../themes";
import ProtectedRoute from "@/config/ProtectRoute";
import EcommerceLogin from "@/ecommerce/EcommerceLogin";
import Dashboard from "@/ecommerce/AdminPanel/Dashboard";
import Category from "@/ecommerce/AdminPanel/Category";
import Products from "@/ecommerce/AdminPanel/Products";
import ProductSizeMaster from "@/ecommerce/AdminPanel/ProductSizeMaster";
import OrderList from "@/ecommerce/AdminPanel/OderList";
import FormAssignment from "@/ecommerce/AdminPanel/FormAssignment";
import RoleList from "@/ecommerce/AdminPanel/RoleList";
import EmployeeList from "@/ecommerce/AdminPanel/EmployeeList";
import News from "@/ecommerce/AdminPanel/News";
import ShopLocator from "@/ecommerce/AdminPanel/ShopLocator";
import SliderMaster from "@/ecommerce/AdminPanel/Slider";
import GalleryFilterMaster from "@/ecommerce/AdminPanel/GalleryFilter";
import GalleryMaster from "@/ecommerce/AdminPanel/Gallery";
import ChangePassword from "@/ecommerce/AdminPanel/ChangePassword";
import AddNewProducts from "@/ecommerce/AdminPanel/Products/AddNewProducts";
import Enquiry from "@/ecommerce/AdminPanel/Enquiry";
import EnquiryList from "@/ecommerce/AdminPanel/Enquiry/EnquiryList";
import CreateNewEnquiry from "@/ecommerce/AdminPanel/Enquiry/CreateNewEnquiry";
import CreateNewEnquiryModal from "@/ecommerce/AdminPanel/Enquiry/CreateNewEnquiry";



import Chemical from "@/ecommerce/AdminPanel/Chemical";
import ChemicalInword from "@/ecommerce/AdminPanel/Chemical/ChemicalInword";
import InwardList from "@/ecommerce/AdminPanel/Chemical/InwardList";
function Router() {
  const routes = [
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <Layout />,
          children: [
            { path: "/", element: <Dashboard /> },

            { path: "categories", element: <Category /> },
            { path: "news", element: <News /> },
            { path: "form-assignment", element: <FormAssignment /> },
            { path: "role-list", element: <RoleList /> },
            { path: "employee-list", element: <EmployeeList /> },
            { path: "Chemical", element: <Chemical /> },
            { path: "chemical-inword", element: <ChemicalInword/> },
            { path: "inword-list", element: <InwardList/> },

            


            { path: "Enquiry-List", element: <Enquiry /> },
 //{ path: "Create-New-Enquiry", element: <CreateNewEnquiry /> },


            { path: "products", element: <Products /> },

            // ✅ NEW PRODUCT CREATION ROUTE
            { path: "product-creation", element: <AddNewProducts /> },

            { path: "add-product", element: <AddProduct /> },
            { path: "product-size-master", element: <ProductSizeMaster /> },
            { path: "product-list", element: <ProductList /> },
            { path: "product-grid", element: <ProductGrid /> },

            { path: "order-list", element: <OrderList /> },
            { path: "shop-locator", element: <ShopLocator /> },
            { path: "slider", element: <SliderMaster /> },
            { path: "gallery", element: <GalleryMaster /> },
            { path: "gallery-filter", element: <GalleryFilterMaster /> },

            { path: "transaction-list", element: <TransactionList /> },
            { path: "transaction-detail", element: <TransactionDetail /> },
            { path: "seller-list", element: <SellerList /> },
            { path: "seller-detail", element: <SellerDetail /> },
            { path: "reviews", element: <Reviews /> },
            { path: "inbox", element: <Inbox /> },
            { path: "file-manager", element: <FileManager /> },
            { path: "point-of-sale", element: <PointOfSale /> },
            { path: "chat", element: <Chat /> },
            { path: "post", element: <Post /> },
            { path: "calendar", element: <Calendar /> },
            { path: "crud-data-list", element: <CrudDataList /> },
            { path: "crud-form", element: <CrudForm /> },

            { path: "update-profile", element: <UpdateProfile /> },
            { path: "change-password", element: <ChangePassword /> },

            { path: "*", element: <ErrorPage /> },
          ],
        },
      ],
    },

    { path: "/login", element: <EcommerceLogin /> },
    { path: "/register", element: <Register /> },
    { path: "/error-page", element: <ErrorPage /> },
    { path: "*", element: <ErrorPage /> },
  ];

  return useRoutes(routes);
}

export default Router;
