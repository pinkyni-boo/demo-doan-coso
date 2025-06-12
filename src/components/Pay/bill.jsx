import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";

function BillPage({ userData, order, selectedMethod }) {
  const [isPaid] = useState(true);
  const [selectedServices, setSelectedServices] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [allSelected, setAllSelected] = useState(true);

  // Initialize selected services when component mounts or order changes
  useEffect(() => {
    if (order?.classes) {
      const initialSelectedState = {};
      order.classes.forEach((cls, idx) => {
        initialSelectedState[idx] = true;
      });
      setSelectedServices(initialSelectedState);

      // Calculate initial total
      calculateTotal(initialSelectedState);
    }
  }, [order]);

  // Toggle single service selection
  const toggleServiceSelection = (idx) => {
    const newSelectedServices = {
      ...selectedServices,
      [idx]: !selectedServices[idx],
    };

    setSelectedServices(newSelectedServices);
    calculateTotal(newSelectedServices);

    // Check if all are selected
    const allServicesSelected = Object.values(newSelectedServices).every(
      (value) => value
    );
    setAllSelected(allServicesSelected);
  };

  // Toggle all services selection/deselection
  const toggleAllServices = () => {
    const newAllSelected = !allSelected;
    const newSelectedServices = {};

    order.classes.forEach((_, idx) => {
      newSelectedServices[idx] = newAllSelected;
    });

    setSelectedServices(newSelectedServices);
    setAllSelected(newAllSelected);
    calculateTotal(newSelectedServices);
  };

  // Calculate total based on selected services
  const calculateTotal = (selectedState) => {
    const total = order.classes.reduce((sum, cls, idx) => {
      return sum + (selectedState[idx] ? cls.price : 0);
    }, 0);

    setTotalAmount(total);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      {isPaid && (
        <div className="bg-gray-100 border border-gray-300 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Hóa đơn thanh toán</h2>

          {/* Toggle all button */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold">Thông tin đơn hàng:</h3>
            <button
              onClick={toggleAllServices}
              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors"
            >
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          {/* Thông tin đơn hàng với checkboxes */}
          <div className="mb-4">
            {order.classes.map((cls, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center mb-2 text-lg"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`service-${idx}`}
                    checked={selectedServices[idx] || false}
                    onChange={() => toggleServiceSelection(idx)}
                    className="mr-3 h-5 w-5 accent-indigo-600 cursor-pointer"
                  />
                  <label htmlFor={`service-${idx}`} className="cursor-pointer">
                    {cls.name}
                  </label>
                </div>
                <span>{cls.price.toLocaleString()}đ</span>
              </div>
            ))}
            <hr className="my-4" />
            <div className="flex justify-between text-xl font-bold ">
              <span>Tổng cộng:</span>
              <span>{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Thông tin người dùng */}
          <div className="mb-4">
            <h3 className="font-semibold">Thông tin người dùng:</h3>
            <div>
              <strong>Tên: </strong>
              {userData.name}
            </div>
            <div>
              <strong>Email: </strong>
              {userData.email}
            </div>
            <div>
              <strong>Số điện thoại: </strong>
              {userData.phone}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="mb-4">
            <h3 className="font-semibold">Phương thức thanh toán:</h3>
            <p>{selectedMethod}</p>
          </div>

          {/* Mã QR */}
          <QRCode
            value="https://example.com/payment-confirmation"
            size={128}
            className="mb-4"
          />
          <p className="mb-4">Mã QR để xác minh hóa đơn tại phòng gym.</p>

          {/* Các nút hành động */}
          <div className="flex gap-4">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.print()}
            >
              In hóa đơn
            </button>
            <Link to="/">
              <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Quay về trang chủ
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// For demonstration only
function App() {
  return (
    <BillPage
      userData={userData}
      order={order}
      selectedMethod={selectedMethod}
    />
  );
}

export default App;
