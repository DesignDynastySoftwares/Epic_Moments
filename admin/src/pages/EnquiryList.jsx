import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App"; // Make sure this path is correct

const EnquiryList = ({ token }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/enquiries`, {
        headers: { token },
      });

      if (Array.isArray(res.data)) {
        // Sort latest first based on createdAt timestamp
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setEnquiries(sorted);
      } else {
        toast.error("Unexpected response format.");
      }
    } catch (err) {
      toast.error("Failed to fetch enquiries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📩 Customer Enquiries</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading enquiries...</p>
      ) : enquiries.length === 0 ? (
        <p className="text-center text-gray-500">No enquiries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Message</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq, idx) => (
                <tr key={idx} className="text-center hover:bg-gray-50">
                  <td className="p-2 border">{enq.name}</td>
                  <td className="p-2 border">{enq.email}</td>
                  <td className="p-2 border text-left">{enq.message}</td>
                  <td className="p-2 border">
                    {new Date(enq.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnquiryList;
