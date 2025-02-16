import "./style.css";
import { useEffect, useRef, useState } from "react";

const ScrapbookCanvas = () => {
  const CanvasRef = useRef(null);
  const CanvasInstance = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    import("fabric").then((fabricModule) => {
      const fabric = fabricModule.fabric || fabricModule.default;

      if (!CanvasInstance.current && CanvasRef.current) {
        CanvasInstance.current = new fabric.Canvas(CanvasRef.current, {
          width: 800,
          height: 500,
          selection: true,
        });

        CanvasInstance.current.setBackgroundColor(
          "#ffffff",
          CanvasInstance.current.renderAll.bind(CanvasInstance.current)
        );
      }
    });

    return () => {
      if (CanvasInstance.current) {
        CanvasInstance.current.dispose();
        CanvasInstance.current = null;
      }
    };
  }, []);

  // Upload Image and Display on Canvas & UI
  const ImageUpload = (event) => {
    if (!CanvasInstance.current) return;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      import("fabric").then((fabricModule) => {
        const fabric = fabricModule.fabric || fabricModule.default;

        fabric.Image.fromURL(e.target.result, (img) => {
          if (!img) {
            console.error("Error loading Image!");
            return;
          }

          img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
            selectable: true,
            evented: true,
          });

          CanvasInstance.current.add(img);
          CanvasInstance.current.renderAll(); // ✅ Ensures the image is displayed

          setUploadedImages((prev) => [...prev, e.target.result]);
        });
      });
    };
    reader.readAsDataURL(file); // ✅ Correctly triggers the image load
  };

  // Toggle Doodle Mode
  const toggleDoodleMode = () => {
    if (!CanvasInstance.current) return;
    setIsDrawing(!isDrawing);
    CanvasInstance.current.isDrawingMode = !CanvasInstance.current.isDrawingMode;

    if (CanvasInstance.current.isDrawingMode) {
      CanvasInstance.current.freeDrawingBrush.width = 5;
      CanvasInstance.current.freeDrawingBrush.color = "#000000";
    }
  };

  // Add Stickers
  const addSticker = (stickerUrl) => {
    if (!CanvasInstance.current) return;

    import("fabric").then((fabricModule) => {
      const fabric = fabricModule.fabric || fabricModule.default;

      fabric.Image.fromURL(stickerUrl, (img) => {
        if (!img) {
          console.error("Error loading Sticker!");
          return;
        }

        img.scaleToWidth(80);
        img.set({
          left: Math.random() * 600,
          top: Math.random() * 400,
          selectable: true,
        });

        CanvasInstance.current.add(img);
        CanvasInstance.current.renderAll();
      });
    });
  };

  // Clear Canvas
  const clearCanvas = () => {
    if (!CanvasInstance.current) return;
    CanvasInstance.current.clear();
    CanvasInstance.current.setBackgroundColor(
      "#ffffff",
      CanvasInstance.current.renderAll.bind(CanvasInstance.current)
    );
    setUploadedImages([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Controls */}
      <div style={{ marginBottom: "20px" }}>
        <input type="file" accept="image/*" onChange={ImageUpload} style={{ marginRight: "10px" }} />
        <button onClick={toggleDoodleMode} style={{ marginRight: "10px" }}>
          {isDrawing ? "Disable Doodling" : "Enable Doodling"}
        </button>
        <button onClick={() => addSticker("https://i.imgur.com/OaiRmYQ.png")} style={{ marginRight: "10px" }}>
          Add Heart Sticker
        </button>
        <button onClick={() => addSticker("https://i.imgur.com/1iR5XfY.png")} style={{ marginRight: "10px" }}>
          Add Star Sticker
        </button>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </div>

      {/* Canvas */}
      <canvas
        ref={CanvasRef}
        style={{
          border: "2px solid #333",
          display: "block",
          backgroundColor: "white",
          marginBottom: "20px",
        }}
      ></canvas>

      {/* Uploaded Images Section */}
      <div className="uploaded-images" style={{ marginTop: "20px" }}>
        <h3>Uploaded Images</h3>
        <div className="image-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {uploadedImages.length > 0 ? (
            uploadedImages.map((img, index) => (
              <div
                key={index}
                className="image-card"
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#f9f9f9",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <img src={img} alt={`Uploaded ${index}`} style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "8px" }} />
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888" }}>No images uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapbookCanvas;
