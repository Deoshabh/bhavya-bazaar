import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/actions/product";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import SafeImage from "../common/SafeImage";

const CreateProduct = () => {
    const { seller } = useSelector((state) => state.seller);
    const { success, error } = useSelector((state) => state.products);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Choose a category");
    const [tags, setTags] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [stock, setStock] = useState("");

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (success) {
            toast.success("Product created successfully!");
            navigate("/dashboard");
            window.location.reload();
        }
    }, [dispatch, error, success, navigate]);

    const handleImageChange = (e) => {
        e.preventDefault();

        let files = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...files]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if seller data is available
        if (!seller || !seller._id) {
            toast.error("Seller information not available. Please log in again.");
            console.error("Seller ID not available");
            return;
        }

        // Validate required fields
        if (!name.trim()) {
            toast.error("Product name is required");
            return;
        }

        if (!description.trim()) {
            toast.error("Product description is required");
            return;
        }

        if (!category || category === "Choose a category") {
            toast.error("Please select a category");
            return;
        }

        if (!discountPrice || parseFloat(discountPrice) <= 0) {
            toast.error("Valid discount price is required");
            return;
        }

        if (!stock || parseInt(stock) <= 0) {
            toast.error("Valid stock quantity is required");
            return;
        }

        if (!images || images.length === 0) {
            toast.error("At least one product image is required");
            return;
        }

        // Validate price logic
        if (originalPrice && parseFloat(discountPrice) >= parseFloat(originalPrice)) {
            toast.error("Discount price must be less than original price");
            return;
        }

        try {
            const newForm = new FormData();

            images.forEach((image) => {
                newForm.append("images", image);
            });
            newForm.append("name", name.trim());
            newForm.append("description", description.trim());
            newForm.append("category", category);
            newForm.append("tags", tags.trim());
            newForm.append("originalPrice", originalPrice || "0");
            newForm.append("discountPrice", discountPrice);
            newForm.append("stock", stock);
            newForm.append("shopId", seller._id);
            
            dispatch(createProduct(newForm));
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Failed to create product. Please try again.");
        }
    };

    return (
        <div className="w-[90%] 800px:w-[50%] bg-white  shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
            <h5 className="text-[30px] font-Poppins text-center">Create Product</h5>
            {/* create product form */}
            <form onSubmit={handleSubmit}>
                <br />
                <div>
                    <label className="pb-2">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your product name..."
                        required
                    />
                </div>
                <br />
                <div>
                    <label className="pb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        cols="30"
                        required
                        rows="8"
                        type="text"
                        name="description"
                        value={description}
                        className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter your product description..."
                    ></textarea>
                </div>
                <br />
                <div>
                    <label className="pb-2">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full mt-2 border h-[35px] rounded-[5px]"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="Choose a category">Choose a category</option>
                        {categoriesData &&
                            categoriesData.map((i) => (
                                <option value={i.title} key={i.title}>
                                    {i.title}
                                </option>
                            ))}
                    </select>
                </div>
                <br />
                <div>
                    <label className="pb-2">Tags</label>
                    <input
                        type="text"
                        name="tags"
                        value={tags}
                        className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter your product tags..."
                    />
                </div>
                <br />
                <div>
                    <label className="pb-2">Original Price</label>
                    <input
                        type="number"
                        name="originalPrice"
                        value={originalPrice}
                        className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="Enter your product price..."
                    />
                </div>
                <br />
                <div>
                    <label className="pb-2">
                        Price (With Discount) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="discountPrice"
                        value={discountPrice}
                        className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder="Enter your product price with discount..."
                        required
                    />
                </div>
                <br />
                <div>
                    <label className="pb-2">
                        Product Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="stock"
                        value={stock}
                        className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Enter your product stock..."
                        required
                    />
                </div>
                <br />
                <div>
                    <label className="pb-2">
                        Upload Images <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        name=""
                        id="upload"
                        className="hidden"
                        multiple
                        onChange={handleImageChange}
                    />
                    <div className="w-full flex items-center flex-wrap">
                        <label htmlFor="upload">
                            <AiOutlinePlusCircle size={30} className="mt-3" color="#555" />
                        </label>
                        {images &&
                            images.map((i) => (
                                <SafeImage
                                    src={URL.createObjectURL(i)}
                                    key={i}
                                    alt=""
                                    className="h-[120px] w-[120px] object-cover m-2"
                                    fallbackType="product"
                                />
                            ))}
                    </div>
                    <br />
                    <div>
                        <input
                            type="submit"
                            value="Create"
                            className="mt-2 cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;