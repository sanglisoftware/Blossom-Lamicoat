import { useState } from "react";
import axios from "axios";
import "./AddNewProducts.css"; // optional

const AddNewProducts = () => {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    agentPercentage: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("/api/products", formData);
      alert("Product created successfully!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}

      <h2 className="page-title">Product Creation</h2>

      {/* Card */}
      <div className="card">
        <div className="flex flex-col items-center p-5 border-b sm:flex-row border-slate-200/60 dark:border-darkmode-400">
        <h3 className="card-title">Fill in the form</h3>
</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Product Description</label>
            <textarea
              name="productDescription"
              placeholder="Enter product description"
              value={formData.productDescription}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Agent Percentage</label>
            <div className="percentage-input">
              <input
                type="number"
                name="agentPercentage"
                placeholder="Enter agent percentage"
                value={formData.agentPercentage}
                onChange={handleChange}
                required
              />
              <span>%</span>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNewProducts;
