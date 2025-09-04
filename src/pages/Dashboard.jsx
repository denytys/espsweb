// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Table, Select } from "antd";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import countryMap from "../utils/CountryMap";
import { logDev } from "../utils/logDev";

export default function Dashboard() {
  const currentYear = new Date().getFullYear();

  const [selectedChart, setSelectedChart] = useState("ecertin"); // Untuk table
  const [selectedYear, setSelectedYear] = useState(currentYear); // Tahun chart
  const [selectedType, setSelectedType] = useState("ecertin"); // Untuk chart
  const [statsData, setStatsData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const token = sessionStorage.getItem("token");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  // Fetch total stats
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_ESPS_BE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStatsData(res.data))
      .catch((err) => logDev("Error fetching stats:", err));
  }, []);

  // Fetch table data
  useEffect(() => {
    if (!statsData?.year) return;
    axios
      .get(
        `${
          import.meta.env.VITE_ESPS_BE
        }/dashboard/tabledata?type=${selectedChart}&year=${statsData.year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setTableData(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => logDev("Error fetching table data:", err));
  }, [selectedChart, statsData.year]);

  // Fetch chart data
  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_ESPS_BE
      }/dashboard/monthly?type=${selectedType}&year=${selectedYear}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((response) => response.json())
      .then((data) => {
        // Inisialisasi semua bulan (1-12) dengan 0
        const months = Array.from({ length: 12 }, (_, i) => ({
          bulan: i + 1,
          jumlah: 0,
        }));

        // Isi data dari backend
        data.forEach((item) => {
          const idx = parseInt(item.bulan) - 1;
          months[idx].jumlah = parseInt(item.total);
        });

        setChartData(months);
      })
      .catch((error) => logDev("Error fetching chart data:", error));
  }, [selectedType, selectedYear]);

  const stats = [
    {
      title: "Ecert In",
      value: statsData.ecert_in || 0,
      icon: <LoginOutlined />,
      color: "bg-purple-500",
    },
    {
      title: "Ephyto In",
      value: statsData.ephyto_in || 0,
      icon: <LoginOutlined />,
      color: "bg-yellow-500",
    },
    {
      title: "Ecert Out",
      value: statsData.eah_out || 0,
      icon: <LogoutOutlined />,
      color: "bg-green-500",
    },
    {
      title: "Ephyto Out",
      value: statsData.ephyto_out || 0,
      icon: <LogoutOutlined />,
      color: "bg-blue-500",
    },
  ];

  const columns = [
    { title: "Negara", dataIndex: "negara", key: "negara" },
    { title: "Jumlah", dataIndex: "jumlah", key: "jumlah" },
  ].map((col) => ({
    ...col,
    onHeaderCell: () => ({ style: { fontSize: "12px", padding: "6px 10px" } }),
    onCell: () => ({ style: { fontSize: "12px", padding: "6px 10px" } }),
  }));

  return (
    <div className="w-full min-h-screen p-2 bg-gray-100">
      {/* Row 1: Stats */}
      <div className="bg-white rounded-xl shadow w-full">
        <h2 className="font-semibold ml-5 mb-2 pt-3">
          Total Ecert dan Ephyto {statsData.year}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center p-2 gap-1 md:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-gray-100 pl-4 pr-35 pt-4 pb-4 gap-3 flex flex-row mb-4 rounded-xl"
            >
              <div
                className={`${stat.color} text-white w-8 h-8 flex items-center justify-center rounded-full text-lg`}
              >
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs">{stat.title}</span>
                <span className="text-xl font-bold">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Chart + Table */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Table Card */}
        <div className="bg-white rounded-xl p-3 shadow w-full md:w-110">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold ml-2">Top Negara {statsData.year}</h2>
            <Select
              value={selectedChart}
              onChange={(value) => setSelectedChart(value)}
            >
              <Select.Option value="ecertin">Ecert In</Select.Option>
              <Select.Option value="ephytoin">Ephyto In</Select.Option>
              <Select.Option value="eahout">Ecert Out</Select.Option>
              <Select.Option value="ephytoout">Ephyto Out</Select.Option>
            </Select>
          </div>
          <Table
            columns={columns}
            dataSource={tableData.map((item, idx) => ({
              key: idx,
              ...item,
              negara: countryMap[item.negara] || item.negara,
            }))}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
          />
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-xl p-3 shadow w-full md:w-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold ml-2">Grafik Bulanan</h2>
            <div className="flex gap-2">
              <Select
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                style={{ width: 90 }}
              >
                <Select.Option value="ecertin">Ecert In</Select.Option>
                <Select.Option value="ephytoin">Ephyto In</Select.Option>
                <Select.Option value="eahout">Ecert Out</Select.Option>
                <Select.Option value="ephytoout">Ephyto Out</Select.Option>
              </Select>
              <Select
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                style={{ width: 90 }}
              >
                {[2024, 2025].map((year) => (
                  <Select.Option key={year} value={year}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="bulan"
                tickFormatter={(month) => monthNames[month - 1]}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                labelFormatter={(month) => monthNames[month - 1]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="jumlah"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
