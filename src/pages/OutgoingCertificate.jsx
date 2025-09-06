import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Modal,
  Spin,
  DatePicker,
  Select,
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
import uptMap from "../utils/UptMap";
import { logDev } from "../utils/logDev";
import { Eye } from "lucide-react";
import {
  CopyOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function OutgoingCertificate() {
  const [eahoutData, seteahoutData] = useState([]);
  const [ephytooutData, setephytooutData] = useState([]);
  const [searcheah, setSearcheah] = useState("");
  const [searchEphyto, setSearchEphyto] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedeahDateRange, setSelectedeahDateRange] = useState(null);
  const [selectedEphytoDateRange, setSelectedEphytoDateRange] = useState(null);
  const [selectedeahUPT, setSelectedeahUPT] = useState(null);
  const [selectedEphytoUPT, setSelectedEphytoUPT] = useState(null);
  const token = sessionStorage.getItem("token");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [xmlContent, setXmlContent] = useState(null);
  const [xmlLoading, setXmlLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const fetchData = async () => {
    setLoadingModal(true);
    try {
      const [eahRes, ephytoRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_ESPS_BE}/outgoing/eahout`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_ESPS_BE}/outgoing/ephytoout`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const eah = Array.isArray(eahRes.data)
        ? eahRes.data
        : Array.isArray(eahRes.data?.data)
        ? eahRes.data.data
        : [];

      const ephyto = Array.isArray(ephytoRes.data)
        ? ephytoRes.data
        : Array.isArray(ephytoRes.data?.data)
        ? ephytoRes.data.data
        : [];

      seteahoutData(eah);
      setephytooutData(ephyto);
    } catch (err) {
      logDev("Fetch error:", err);
      seteahoutData([]);
      setephytooutData([]);
    } finally {
      setLoadingModal(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 300000); // refresh saben 5 menit
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

  const eahoutDataSource = eahoutData
    .filter((r) => matchesSearch(r, searcheah)) // Golet text
    .filter((r) =>
      matchesAdvancedFilters(r, selectedeahDateRange, selectedeahUPT)
    ) // Filter tanggalan karo UPT
    .map((row, i) => ({
      key: row.id_cert ?? `${row.no_cert ?? "eah"}-${i}`,
      ...row,
    }));

  const ephytooutDataSource = ephytooutData
    .filter((r) => matchesSearch(r, searchEphyto)) // Golet text
    .filter((r) =>
      matchesAdvancedFilters(r, selectedEphytoDateRange, selectedEphytoUPT)
    ) // Filter tanggalan karo UPT
    .map((row, i) => ({
      key: row.id_hub ?? `${row.no_cert ?? "ephyto"}-${i}`,
      ...row,
    }));

  const smallCellStyle = { fontSize: "12px", padding: "8px 16px" };

  const handleEdit = (record, source) => {
    setSelectedRecord(record);
    setSelectedSource(source); // <= simpan sumbernya
    setXmlContent(null); // reset preview tiap buka modal
    setIsDetailModalOpen(true);
  };

  const handleCancelDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const handleLoadXml = async (id_cert, keyName, source) => {
    setXmlLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_ESPS_BE
        }/outgoing/${source}/${id_cert}/${keyName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setXmlContent({ key: keyName, value: res.data?.[keyName] || null });
    } catch {
      message.error(`Gagal load ${keyName}`);
    } finally {
      setXmlLoading(false);
    }
  };

  const eahColumns = [
    { title: "Tgl Sertifikat", dataIndex: "tgl_cert", key: "tgl_cert" },
    { title: "No Sertifikat", dataIndex: "no_cert", key: "no_cert" },
    { title: "Jenis Dokumen", dataIndex: "doc_type", key: "doc_type" },
    { title: "Komoditas", dataIndex: "komoditi", key: "komoditi" },
    { title: "Negara Tujuan", dataIndex: "neg_tuju", key: "neg_tuju" },
    { title: "UPT/Satpel", dataIndex: "upt", key: "upt" },
    {
      title: "Via Data",
      dataIndex: "send_to",
      key: "send_to",
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
              <Tag color={viaColors[d.send_to] || "blue"} key={index}>
                {d.send_to}
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
          onClick={() => handleEdit(record, "eahout")}
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
    { title: "Komoditas", dataIndex: "komoditi", key: "komoditi" },
    { title: "Negara Tujuan", dataIndex: "neg_tuju", key: "neg_tuju" },
    { title: "UPT/Satpel", dataIndex: "upt", key: "upt" },
    {
      title: "Via Data",
      dataIndex: "send_to",
      key: "send_to",
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
              <Tag color={viaColors[d.send_to] || "blue"} key={index}>
                {d.send_to}
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
          onClick={() => handleEdit(record, "ephytoout")}
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
            {/* detail biasa */}
            {Object.entries(selectedRecord).map(([key, value]) => (
              <div
                key={key}
                className="flex ml-2 border-b border-gray-200 py-1"
              >
                <div className="w-1/4 font-semibold capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="w-2/3 break-words">{String(value ?? "-")}</div>
              </div>
            ))}

            {/* baris khusus XML (outgoing = xml) */}
            <div className="flex ml-2 border-b border-gray-200 py-1">
              <div className="w-1/4 font-semibold">XML</div>
              <div className="w-3/4 break-words">
                {xmlContent ? (
                  <div>
                    <Button
                      size="small"
                      type="primary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            xmlContent.value || ""
                          );
                          message.success("xml copied!");
                        } catch {
                          message.error("Failed to copy!");
                        }
                      }}
                    >
                      Copy xml
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
                      const id = selectedRecord?.id_cert; // OUTGOING SELALU id_cert
                      if (!id) return message.error("id_cert tidak ditemukan");

                      handleLoadXml(id, "xml", selectedSource); // ecertout / ephytoout
                    }}
                  >
                    Preview xml
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* eah Out */}
      <Card className="p-3 shadow-sm !mb-4">
        <div className="flex flex-wrap gap-2 justify-between mb-2">
          <h3 className="text-lg font-semibold ml-1">Eah Out</h3>
          <div className="flex flex-wrap gap-2">
            <DatePicker.RangePicker
              onChange={(dates) => setSelectedeahDateRange(dates)} // Tanggalan
              style={{ marginBottom: 8 }}
              placeholder={["Dari", "Sampai"]}
            />
            <Select
              allowClear
              placeholder="Pilih UPT"
              onChange={(value) => setSelectedeahUPT(value)} // UPT ning kene
              options={[...new Set(eahoutData.map((d) => d.upt))]
                .filter(Boolean)
                .map((upt) => ({ label: upt, value: upt }))}
              style={{ width: 150, marginBottom: 8 }}
            />
            <Input.Search
              placeholder="Search eah Out..."
              allowClear
              value={searcheah}
              onChange={(e) => setSearcheah(e.target.value)} // Golet
              style={{ width: 250, marginBottom: 8 }}
            />
          </div>
        </div>

        <Table
          columns={eahColumns}
          dataSource={eahoutDataSource.map((item, idx) => ({
            key: idx,
            ...item,
            neg_tuju: countryMap[item.neg_tuju] || item.neg_tuju,
            upt: uptMap[item.upt] || item.upt,
          }))}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
          }}
          bordered
        />
      </Card>

      {/* Ephyto Out */}
      <Card className="p-3 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-2 justify-between mb-2">
          <h3 className="text-lg font-semibold ml-1">Ephyto Out</h3>
          <div className="flex flex-wrap gap-2">
            <DatePicker.RangePicker
              onChange={(dates) => setSelectedEphytoDateRange(dates)} // tanggalan
              style={{ marginBottom: 8 }}
              placeholder={["Dari", "Sampai"]}
            />
            <Select
              allowClear
              placeholder="Pilih UPT"
              onChange={(value) => setSelectedEphytoUPT(value)} // UPT ning kene
              options={[...new Set(ephytooutData.map((d) => d.upt))]
                .filter(Boolean)
                .map((upt) => ({ label: upt, value: upt }))}
              style={{ width: 150, marginBottom: 8 }}
            />
            <Input.Search
              placeholder="Search eah Out..."
              allowClear
              value={searchEphyto}
              onChange={(e) => setSearchEphyto(e.target.value)} // Golet
              style={{ width: 250, marginBottom: 8 }}
            />
          </div>
        </div>
        <Table
          columns={ephytoColumns}
          dataSource={ephytooutDataSource.map((item, idx) => ({
            key: idx,
            ...item,
            neg_tuju: countryMap[item.neg_tuju] || item.neg_tuju,
            upt: uptMap[item.upt] || item.upt,
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
