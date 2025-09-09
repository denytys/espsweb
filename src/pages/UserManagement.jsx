import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  message,
  Tag,
  Modal,
  Form,
  Input,
  theme,
  notification,
} from "antd";
import axios from "axios";
import uptMap from "../utils/UptMap";
import { FilePenLine } from "lucide-react";
import { logDev } from "../utils/logDev";

export default function UserManagement() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const token = sessionStorage.getItem("token");

  // 🎨 ambil token dari ConfigProvider (otomatis ikut dark/light)
  const { token: antdToken } = theme.useToken();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_ESPS_BE}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status) {
          setUserData(res.data.data);
        } else {
          messageApi.error("Data user tidak ditemukan.");
        }
      } catch (error) {
        messageApi.error("Gagal memuat data user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [messageApi, token]);

  const handleUpdate = async (username, values) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_ESPS_BE}/users/${username}`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status) {
        setUserData((prev) =>
          prev.map((user) =>
            user.username === username ? { ...user, ...values } : user
          )
        );

        messageApi.success("User berhasil diperbarui!");
        setIsModalOpen(false);
      } else {
        messageApi.error("Gagal memperbarui user!");
      }
    } catch (err) {
      logDev(err);
      notification.error({
        message: "Kesalahan",
        description: "Terjadi kesalahan saat update.",
        placement: "topRight",
      });
    }
  };

  const handleEdit = (record) => {
    setSelectedUser(record);
    form.setFieldsValue(record); // isi form modal dengan data user terpilih
    setIsModalOpen(true); // buka modal
  };

  const roleColors = {
    CP: "red",
    QO: "green",
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Nama Lengkap",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Negara",
      dataIndex: "id_country",
      key: "id_country",
      render: (id_country) => uptMap[id_country] || id_country,
    },
    {
      title: "Role",
      dataIndex: "level",
      key: "level",
      render: (level) => <Tag color={roleColors[level] || "blue"}>{level}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div
          onClick={() => handleEdit(record)}
          className="cursor-pointer rounded-full bg-gray-200 hover:bg-blue-500 text-black hover:text-white w-8 h-8 flex items-center justify-center transition-colors duration-200"
        >
          <FilePenLine size={16} />
        </div>
      ),
    },
  ];

  return (
    <div
      className="w-full min-h-screen p-2"
      style={{ background: antdToken.colorBgLayout }}
    >
      {contextHolder}

      <div
        style={{
          background: antdToken.colorBgContainer,
          boxShadow: antdToken.boxShadow,
          borderRadius: antdToken.borderRadiusLG,
          padding: 20,
        }}
      >
        <div
          className="items-center border-b pb-2 gap-2 mb-4"
          style={{ borderColor: antdToken.colorBorder }}
        >
          <Typography.Text strong className="text-base">
            User Management
          </Typography.Text>
        </div>

        <Table
          columns={columns}
          dataSource={userData.map((item) => ({ ...item, key: item.username }))}
          rowKey="username"
          loading={loading}
          bordered
          size="small"
        />
      </div>

      {/* 🔹 Modal Edit User */}
      <Modal
        title="Edit User"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={async () => {
          try {
            const values = await form.validateFields(); // ambil data form
            handleUpdate(selectedUser.username, values); // kirim username + data update
            setIsModalOpen(false); // tutup modal setelah update
          } catch (error) {
            logDev("Validasi gagal:", error);
          }
        }}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nama Lengkap"
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email wajib diisi" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
