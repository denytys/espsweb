// src/pages/IncomingCertificate.jsx
import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Modal,
  Spin,
  DatePicker,
  Tag,
  Button,
  message,
  Card,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import countryMap from "../utils/CountryMap";
import { logDev } from "../utils/logDev";
import { Eye } from "lucide-react";

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // state khusus xml/xmlsigned
  const [xmlLoading, setXmlLoading] = useState(false);
  const [xmlContent, setXmlContent] = useState(null);

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
      return true;
    }

    const rowDate = dayjs(row.tgl_cert, "YYYY-MM-DD");
    return (
      rowDate.isValid() &&
      rowDate.isSameOrAfter(dateRange[0].startOf("day")) &&
      rowDate.isSameOrBefore(dateRange[1].endOf("day"))
    );
  };

  const ecertinDataSource = ecertinData
    .filter((r) => matchesSearch(r, searchEcert))
    .filter((r) => matchesAdvancedFilters(r, selectedEcertDateRange))
    .map((row, i) => ({
      key: row.id_cert ?? `${row.no_cert ?? "ecert"}-${i}`,
      ...row,
    }));

  const ephytoinDataSource = ephytoinData
    .filter((r) => matchesSearch(r, searchEphyto))
    .filter((r) => matchesAdvancedFilters(r, selectedEphytoDateRange))
    .map((row, i) => ({
      key: row.id_hub ?? `${row.no_cert ?? "ephyto"}-${i}`,
      ...row,
    }));

  const smallCellStyle = { fontSize: "12px", padding: "8px 16px" };

  const handleEdit = (record) => {
    setSelectedRecord({
      ...record,
      xmlsigned: null,
    });
    setIsDetailModalOpen(true);
    setXmlContent(null); // reset tiap kali buka modal baru
  };

  const handleCancelDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedRecord(null);
    setXmlContent(null);
  };

  // handler load xml/xmlsigned manual
  const handleLoadXml = async (id, keyName, source) => {
    setXmlLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ESPS_BE}/incoming/${source}/${id}/${keyName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setXmlContent({ key: keyName, value: res.data?.[keyName] || null });
    } catch {
      message.error(`Gagal load ${keyName}`);
    } finally {
      setXmlLoading(false);
    }
  };

  const ecertColumns = [
    { title: "Tgl Sertifikat", dataIndex: "tgl_cert", key: "tgl_cert" },
    { title: "No Sertifikat", dataIndex: "no_cert", key: "no_cert" },
    { title: "Jenis Dokumen", dataIndex: "doc_type", key: "doc_type" },
    { title: "Komoditas", dataIndex: "komo_eng", key: "komo_eng" },
    { title: "Pelabuhan Asal", dataIndex: "port_asal", key: "port_asal" },
    { title: "Pelabuhan Tujuan", dataIndex: "port_tuju", key: "port_tuju" },
    {
      title: "Act",
      dataIndex: "act",
      key: "act",
      render: (_, record) => (
        <div
          onClick={() => handleEdit(record)}
          className="cursor-pointer bg-gray-200 hover:bg-blue-500 text-black hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
        >
          <Eye size={16} />
        </div>
      ),
    },
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
    { title: "Negara Asal", dataIndex: "neg_asal", key: "neg_asal" },
    { title: "Pelabuhan Tujuan", dataIndex: "port_tuju", key: "port_tuju" },
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
    {
      title: "Act",
      dataIndex: "act",
      key: "act",
      render: (_, record) => (
        <div
          onClick={() => handleEdit(record)}
          className="cursor-pointer bg-gray-200 hover:bg-blue-500 text-black hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
        >
          <Eye size={16} />
        </div>
      ),
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

      {/* Modal Detail Record */}
      <Modal
        title={
          <div className="px-2 py-2 bg-gray-400/10 rounded font-semibold">
            Detail Data
          </div>
        }
        open={isDetailModalOpen}
        onCancel={handleCancelDetail}
        footer={null}
        width={700}
      >
        {selectedRecord && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {Object.entries(selectedRecord).map(([key, value]) => (
              <div
                key={key}
                className="flex ml-2 border-b border-gray-200 py-1"
              >
                <div className="w-1/4 font-semibold capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="w-3/4 break-words">
                  {key === "xml" || key === "xmlsigned" ? (
                    xmlContent && xmlContent.key === key ? (
                      <div>
                        <Button
                          size="small"
                          type="primary"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                xmlContent.value
                              );
                              message.success(`${key} copied!`);
                            } catch {
                              message.error("Failed to copy!");
                            }
                          }}
                        >
                          Copy {key}
                        </Button>
                        <pre className="mt-2 p-2 border-1 border-gray-400 rounded max-h-40 overflow-y-auto text-xs">
                          {xmlContent.value}
                        </pre>
                      </div>
                    ) : (
                      <Button
                        size="small"
                        loading={xmlLoading}
                        onClick={() => {
                          if (selectedRecord.id_cert) {
                            // ini ecertin
                            handleLoadXml(
                              selectedRecord.id_cert,
                              key,
                              "ecertin"
                            );
                          } else if (selectedRecord.id_hub) {
                            // ini ephytoin
                            handleLoadXml(
                              selectedRecord.id_hub,
                              key,
                              "ephytoin"
                            );
                          } else {
                            message.error("ID tidak ditemukan");
                          }
                        }}
                      >
                        Preview {key}
                      </Button>
                    )
                  ) : (
                    String(value ?? "-")
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Ecert In */}
      <Card className="p-3 shadow-sm !mb-3">
        <div className="flex flex-wrap gap-2 justify-between mb-2">
          <h3 className="text-lg font-semibold ml-1">Ecert In</h3>
          <div className="flex flex-wrap gap-2">
            <DatePicker.RangePicker
              onChange={(dates) => setSelectedEcertDateRange(dates)}
              style={{ marginBottom: 8 }}
              placeholder={["Dari", "Sampai"]}
            />
            <Input.Search
              placeholder="Search Ecert In..."
              allowClear
              value={searchEcert}
              onChange={(e) => setSearchEcert(e.target.value)}
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
      </Card>

      {/* Ephyto In */}
      <Card className="p-3 shadow-sm">
        <div className="flex flex-wrap gap-2 justify-between mb-2">
          <h3 className="text-lg font-semibold ml-1">Ephyto In</h3>
          <div className="flex flex-wrap gap-2">
            <DatePicker.RangePicker
              onChange={(dates) => setSelectedEphytoDateRange(dates)}
              style={{ marginBottom: 8 }}
              placeholder={["Dari", "Sampai"]}
            />
            <Input.Search
              placeholder="Search Ephyto In..."
              allowClear
              value={searchEphyto}
              onChange={(e) => setSearchEphyto(e.target.value)}
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
      </Card>
    </div>
  );
}
