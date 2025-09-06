import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Typography,
  Input,
  Button,
  message,
  Table,
  Modal,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import countryMap from "../utils/CountryMap";
import { FilePenLine } from "lucide-react";
import { logDev } from "../utils/logDev";

export default function NegaraMitra() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm(); // form untuk modal edit
  const [neg, setNeg] = useState("");
  const [doc, setDoc] = useState("");
  const [via, setVia] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });

  const { Option } = Select;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const key = "updatable";
  const token = sessionStorage.getItem("token");

  // Fetch data awal
  const fetchData = async (page = 1, limit = 5) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_ESPS_BE}/countryset`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
        { params: { page, limit } }
      );

      if (res.data.status) {
        const rows = res.data.data || [];
        const formatted = rows.map((item, idx) => ({
          key: item.id,
          id: item.id,
          id_neg: item.id_neg,
          negara: countryMap[item.id_neg] || item.id_neg,
          doc: item.doc,
          via: item.via,
        }));

        setPreviewData(formatted);
        setPagination({
          current: page,
          pageSize: limit,
          total: res.data.pagination?.total || 0,
        });
      }
    } catch (err) {
      logDev("Gagal ambil data:", err);
    }
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      messageApi.open({ key, type: "loading", content: "Menyimpan data..." });

      const res = await axios.post(
        `${import.meta.env.VITE_ESPS_BE}/countryset`,
        {
          id_neg: neg,
          doc: doc,
          via: via,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status) {
        fetchData(pagination.current, pagination.pageSize);
        messageApi.open({
          key,
          type: "success",
          content: res.data.message || "Data berhasil disimpan",
          duration: 2,
        });
        form.resetFields();
        setNeg("");
        setDoc("");
        setVia("");
      } else {
        messageApi.open({
          key,
          type: "error",
          content: res.data?.message || "Gagal menyimpan data",
          duration: 2,
        });
      }
    } catch (err) {
      logDev("Gagal submit:", err);
      messageApi.open({
        key,
        type: "error",
        content: "Terjadi kesalahan saat mengirim data.",
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Update data negara mitra
  const handleUpdate = async (id, values) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_ESPS_BE}/countryset/${id}`,
        {
          id_neg: values.id_neg,
          doc: values.doc,
          via: values.via,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        messageApi.success("Data berhasil diperbarui!");
        setIsModalOpen(false);
        fetchData(pagination.current, pagination.pageSize);
      } else {
        messageApi.error("Gagal memperbarui data!");
      }
    } catch (err) {
      logDev(err);
      messageApi.error("Terjadi kesalahan saat update.");
    }
  };

  const handleEdit = (record) => {
    setSelectedRow(record);
    editForm.setFieldsValue({
      id_neg: record.id_neg,
      doc: record.doc,
      via: record.via,
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: "Negara", dataIndex: "negara", key: "negara" },
    { title: "Doc", dataIndex: "doc", key: "doc" },
    { title: "Via", dataIndex: "via", key: "via" },
    {
      title: "Act",
      key: "action",
      render: (_, record) => (
        <div
          onClick={() => handleEdit(record)}
          className="cursor-pointer bg-gray-200 hover:bg-blue-500 text-black hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
        >
          <FilePenLine size={16} />
        </div>
      ),
    },
  ];

  // Saat ganti halaman
  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo.current, paginationInfo.pageSize);
  };

  return (
    <div className="w-full min-h-screen p-2 space-y-4">
      {contextHolder}
      <Card className="shadow rounded-lg p-4 !mb-4">
        <div className="border-b border-gray-200 pb-2 items-center gap-2 mb-4">
          <Typography.Text strong className="text-base">
            Form Input Negara Mitra
          </Typography.Text>
        </div>
        <Form
          layout="vertical"
          form={form}
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Negara" name="Neg">
                <Select value={neg} onChange={(value) => setNeg(value)}>
                  {Object.entries(countryMap).map(([code, name]) => (
                    <Option key={code} value={code}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Doc" name="Doc">
                <Select value={doc} onChange={(value) => setDoc(value)}>
                  <Option value="KH">KH</Option>
                  <Option value="KI">KI</Option>
                  <Option value="KT">KT</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Via" name="Via">
                <Select value={via} onChange={(value) => setVia(value)}>
                  <Option value="asw">asw</Option>
                  <Option value="h2h">h2h</Option>
                  <Option value="ippc">ippc</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-2">
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
              Submit
            </Button>
            <Button onClick={() => form.resetFields()}>Cancel</Button>
          </div>
        </Form>
      </Card>

      {previewData.length > 0 && (
        <Card className="shadow rounded-lg p-4">
          <div className="items-center border-b border-gray-200 pb-2 gap-1 mb-2">
            <Typography.Text strong className="text-base">
              Data Negara Mitra
            </Typography.Text>
          </div>
          <Table
            dataSource={previewData}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
            rowKey="key"
          />
        </Card>
      )}

      {/* 🔹 Modal Edit Negara Mitra */}
      <Modal
        title="Edit Negara Mitra"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={async () => {
          try {
            const values = await editForm.validateFields();
            handleUpdate(selectedRow.key, values);
          } catch (error) {
            logDev("Validasi gagal:", error);
          }
        }}
        okText="Update"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Negara" name="id_neg">
            <Select>
              {Object.entries(countryMap).map(([code, name]) => (
                <Select.Option key={code} value={code}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Doc" name="doc">
            <Select>
              <Select.Option value="KH">KH</Select.Option>
              <Select.Option value="KI">KI</Select.Option>
              <Select.Option value="KT">KT</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Via" name="via">
            <Select>
              <Select.Option value="asw">asw</Select.Option>
              <Select.Option value="h2h">h2h</Select.Option>
              <Select.Option value="ippc">ippc</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
