import { useState, useEffect } from "react";
import { Table, Input, Modal, Spin, DatePicker, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import countryMap from "../utils/CountryMap";
import { logDev } from "../utils/logDev";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function IncomingCertificate() {
  const [ecertinData, setecertinData] = useState([]);
  const [ephytoinData, setephytoinData] = useState([]);
  const [searchEcert, setSearchEcert] = useState("");
  const [searchEphyto, setSearchEphyto] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedEcertDateRange, setSelectedEcertDateRange] = useState(null);
  const [selectedEphytoDateRange, setSelectedEphytoDateRange] = useState(null);
  const token = sessionStorage.getItem("token");

  const fetchData = async () => {
    setLoadingModal(true);
    try {
      const [ecertRes, ephytoRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_ESPS_BE}/incoming/ecertin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_ESPS_BE}/incoming/ephytoin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const ecert = Array.isArray(ecertRes.data)
        ? ecertRes.data
        : Array.isArray(ecertRes.data?.data)
        ? ecertRes.data.data
        : [];

      const ephyto = Array.isArray(ephytoRes.data)
        ? ephytoRes.data
        : Array.isArray(ephytoRes.data?.data)
        ? ephytoRes.data.data
        : [];

      setecertinData(ecert);
      setephytoinData(ephyto);
    } catch (err) {
      logDev("Fetch error:", err);
      setecertinData([]);
      setephytoinData([]);
    } finally {
      setLoadingModal(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 300000); // refresh tiap 5 menit
    return () => clearInterval(interval);
  }, []);

  const matchesSearch = (row, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return Object.values(row).some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(s)
    );
  };

  const matchesAdvancedFilters = (row, dateRange) => {
    if (
      !dateRange ||
      dateRange.length !== 2 ||
      !dateRange[0] ||
      !dateRange[1]
    ) {
      return true; // langka filter tanggal
    }

    const rowDate = dayjs(row.tgl_cert, "YYYY-MM-DD"); // madakena format tanggalan
    return (
      rowDate.isValid() &&
      rowDate.isSameOrAfter(dateRange[0].startOf("day")) &&
      rowDate.isSameOrBefore(dateRange[1].endOf("day"))
    );
  };

  const ecertinDataSource = ecertinData
    .filter((r) => matchesSearch(r, searchEcert)) // Golet text
    .filter((r) => matchesAdvancedFilters(r, selectedEcertDateRange)) // Filter tanggalan
    .map((row, i) => ({
      key: row.id_cert ?? `${row.no_cert ?? "ecert"}-${i}`,
      ...row,
    }));

  const ephytoinDataSource = ephytoinData
    .filter((r) => matchesSearch(r, searchEphyto)) // Golet text
    .filter((r) => matchesAdvancedFilters(r, selectedEphytoDateRange)) // Filter tanggalan
    .map((row, i) => ({
      key: row.id_hub ?? `${row.no_cert ?? "ephyto"}-${i}`,
      ...row,
    }));

  const smallCellStyle = { fontSize: "12px", padding: "8px 16px" };

  const ecertColumns = [
    { title: "Tgl Sertifikat", dataIndex: "tgl_cert", key: "tgl_cert" },
    { title: "No Sertifikat", dataIndex: "no_cert", key: "no_cert" },
    { title: "Jenis Dokumen", dataIndex: "doc_type", key: "doc_type" },
    { title: "Komoditas", dataIndex: "komo_eng", key: "komo_eng" },
    { title: "Pelabuhan Asal", dataIndex: "port_asal", key: "port_asal" },
    { title: "Negara Asal", dataIndex: "neg_asal", key: "neg_asal" },
    { title: "Pelabuhan Tujuan", dataIndex: "port_tuju", key: "port_tuju" },
    { title: "Kota Tujuan", dataIndex: "tujuan", key: "tujuan" },
  ].map((col) => ({
    ...col,
    onHeaderCell: () => ({ style: smallCellStyle }),
    onCell: () => ({ style: smallCellStyle }),
  }));

  const ephytoColumns = [
    { title: "Tgl Sertifikat", dataIndex: "tgl_cert", key: "tgl_cert" },
    { title: "No Sertifikat", dataIndex: "no_cert", key: "no_cert" },
    { title: "Jenis Dokumen", dataIndex: "doc_type", key: "doc_type" },
    { title: "Komoditas", dataIndex: "komo_eng", key: "komo_eng" },
    { title: "Pelabuhan Asal", dataIndex: "port_asal", key: "port_asal" },
    { title: "Negara Asal", dataIndex: "neg_asal", key: "neg_asal" },
    { title: "Pelabuhan Tujuan", dataIndex: "port_tuju", key: "port_tuju" },
    { title: "Kota Tujuan", dataIndex: "kota_tuju", key: "kota_tuju" },
    {
      title: "Asal Data",
      dataIndex: "data_from",
      key: "data_from",
      render: (detil) => {
        if (typeof detil === "string") {
          const color = viaColors[detil] || "blue";
          return <Tag color={color}>{detil}</Tag>;
        }
        if (!detil) {
          return <Tag color="default">Tidak ada data</Tag>;
        }
        let data = Array.isArray(detil) ? detil : [detil];
        const filtered = data.filter((d) => d?.send_to);

        if (filtered.length === 0) {
          return <Tag color="default">Tidak ada data</Tag>;
        }

        return (
          <>
            {filtered.map((d, index) => (
              <Tag color={viaColors[d.data_from] || "blue"} key={index}>
                {d.data_from}
              </Tag>
            ))}
          </>
        );
      },
    },
  ].map((col) => ({
    ...col,
    onHeaderCell: () => ({ style: smallCellStyle }),
    onCell: () => ({ style: smallCellStyle }),
  }));

  const viaColors = {
    asw: "red",
    h2h: "green",
    ippc: "geekblue",
    // stok: "purple",
    // stok: "orange",
    // stok: "volcano",
  };

  return (
    <div className="w-full min-h-screen p-2">
      {/* Loading Modal */}
      <Modal open={loadingModal} footer={null} closable={false} centered>
        <div className="text-center p-4">
          <Spin size="large" />
          <div className="mt-3 font-semibold">Loading . . . </div>
        </div>
      </Modal>

      {/* Ecert In */}
      <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
        <div className="flex flex-wrap gap-2 justify-between mb-2">
          <h3 className="text-lg font-semibold ml-1">Ecert In</h3>
          <div className="flex flex-wrap gap-2">
            <DatePicker.RangePicker
              onChange={(dates) => setSelectedEcertDateRange(dates)} // Tanggalan
              style={{ marginBottom: 8 }}
              placeholder={["Dari", "Sampai"]}
            />
            <Input.Search
              placeholder="Search Ecert Out..."
              allowClear
              value={searchEcert}
              onChange={(e) => setSearchEcert(e.target.value)} // Golet
              style={{ width: 250, marginBottom: 8 }}
            />
          </div>
        </div>
        <Table
          columns={ecertColumns}
          dataSource={ecertinDataSource.map((item, idx) => ({
            key: idx,
            ...item,
            neg_asal: countryMap[item.neg_asal] || item.neg_asal,
          }))}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          bordered
        />
      </div>

      {/* Ephyto In */}
      <div className="p-3 bg-white rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-2 justify-between mb-2">
          <h3 className="text-lg font-semibold ml-1">Ephyto In</h3>
          <div className="flex flex-wrap gap-2">
            <DatePicker.RangePicker
              onChange={(dates) => setSelectedEphytoDateRange(dates)} // tanggalan
              style={{ marginBottom: 8 }}
              placeholder={["Dari", "Sampai"]}
            />
            <Input.Search
              placeholder="Search Ecert Out..."
              allowClear
              value={searchEphyto}
              onChange={(e) => setSearchEphyto(e.target.value)} // Golet
              style={{ width: 250, marginBottom: 8 }}
            />
          </div>
        </div>
        <Table
          columns={ephytoColumns}
          dataSource={ephytoinDataSource.map((item, idx) => ({
            key: idx,
            ...item,
            neg_asal: countryMap[item.neg_asal] || item.neg_asal,
          }))}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          bordered
        />
      </div>
    </div>
  );
}
