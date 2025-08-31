import React from "react";
import { SmileTwoTone, FrownOutlined } from "@ant-design/icons";
import { Result, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";

export default function Maintenance() {
  const navigate = useNavigate();
  const [auto, setAuto] = React.useState(false);
  const [percent, setPercent] = React.useState(-50);
  const [showTwoTone, setShowTwoTone] = React.useState(false);

  const timerRef = React.useRef(null);
  const iconToggleRef = React.useRef(null);

  // Animasi spinner
  React.useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPercent((v) => {
        const nextPercent = v + 5;
        return nextPercent > 150 ? -50 : nextPercent;
      });
    }, 100);
    return () => clearTimeout(timerRef.current);
  }, [percent]);

  // Toggle icon setiap 2 detik
  React.useEffect(() => {
    iconToggleRef.current = setInterval(() => {
      setShowTwoTone((prev) => !prev);
    }, 2000);
    return () => clearInterval(iconToggleRef.current);
  }, []);

  const mergedPercent = auto ? "auto" : percent;

  return (
    <div className="w-full min-h-screen p-2 bg-gray-100">
      <div className="bg-white/45 shadow-md rounded-xl mb-30">
        <Result
          icon={
            <div style={{ transition: "opacity 0.5s ease-in-out" }}>
              {showTwoTone ? (
                <SmileTwoTone
                  style={{ fontSize: 48, transition: "all 0.5s ease-in-out" }}
                />
              ) : (
                <FrownOutlined
                  style={{
                    color: "#57564F",
                    fontSize: 48,
                    transition: "all 0.5s ease-in-out",
                  }}
                />
              )}
            </div>
          }
          extra={
            <>
              {/* Spinner di tengah */}
              <div
                style={{
                  margin: "16px 0",
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <Spin percent={mergedPercent} size="large" />
                <Spin percent={mergedPercent} size="large" />
                <Spin percent={mergedPercent} size="large" />
              </div>

              <h2 className="mb-10">
                Maaf, Halaman ini sedang dalam perbaikan!
              </h2>

              <Button type="primary" onClick={() => navigate("/")}>
                ← Kembali
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}
