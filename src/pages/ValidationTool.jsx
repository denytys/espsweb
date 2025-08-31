import React, { useState } from "react";
import {
  Form,
  Input,
  Card,
  Space,
  Button,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { ShieldCheck } from "lucide-react";

const { TextArea } = Input;
const statusMap = {
  pending: {
    color: "default",
    text: "Pending",
    icon: <ClockCircleOutlined size={16} />,
  },
  valid: {
    color: "success",
    text: "Valid",
    icon: <CheckCircleOutlined size={16} />,
  },
  invalid: {
    color: "error",
    text: "Invalid",
    icon: <CloseCircleOutlined size={16} />,
  },
};

export default function ValidationTool({
  title = "Validation Tool",
  status = "pending",
  onValidate,
  validateText = "Validation",
  loadingText = "Validating...",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      let res;
      if (typeof onValidate === "function") {
        res = await onValidate();
      } else {
        await new Promise((r) => setTimeout(r, 800));
        res = { ok: true, message: "Validation sukses (demo)." };
      }
      if (res && typeof res === "object") {
        if (res.ok) message.success(res.message || "Data valid.");
        else message.error(res.message || "Data tidak valid.");
      }
    } catch (err) {
      message.error(err?.message || "Gagal menjalankan validasi.");
    } finally {
      setLoading(false);
    }
  };

  const chip = statusMap[status] || statusMap.pending;

  return (
    <div className="w-full min-h-screen p-2">
      <Card
        className="shadow-sm"
        title={
          <Space size={8} align="center">
            <ShieldCheck size={18} />
            <Typography.Text strong>{title}</Typography.Text>
            {/* <Tag color={chip.color} className="ml-2 flex items-center gap-1">
              <span className="inline-flex items-center gap-1">
                {chip.icon}
                {chip.text}
              </span>
            </Tag> */}
          </Space>
        }
      >
        <Form>
          <Form.Item label="input xml" name="input xml">
            <TextArea rows={10} />
          </Form.Item>
        </Form>
      </Card>

      <div className="mt-4 flex justify-end">
        <Button
          type="primary"
          size="large"
          onClick={handleValidate}
          loading={loading}
          disabled={disabled}
        >
          {loading ? loadingText : validateText}
        </Button>
      </div>
    </div>
  );
}
