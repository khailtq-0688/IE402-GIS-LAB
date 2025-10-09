# NHÓM 2- IE402
Dưới đây là danh sách các thành viên đã thực hiện dự án này:

| STT | Mã Số Sinh Viên | Họ và Tên |
| :---: | :---: | :--- |
| 1 | 22520205 | Cao Thành Đạt |
| 2 | 22520296 | Đặng Đông Đức Dương |
| 3 | 22520309 | Phạm Hải Dương |
| 4 | 22520315 | Lê Đức Anh Duy |
| 5 | 22520546 | Lê Đặng Hoàng Huy |
| 6 | 22520587 | Vũ Quang Huy |
| 7 | 22520603 | Lê Trần Quang Khải |
| 8 | 22520732 | An Nhất Lâm |
## 1. Cấu trúc Project

```
lab1/
├── map_index.html
├── icons/
│   └── ... (các icon địa điểm: trường học, bệnh viện, công viên, ...)
├── location_data/
│   └── ... (dữ liệu vị trí các quận/huyện dưới dạng file JS)
├── resourse/
│   ├── get-location.html
│   ├── graphic-json.html
│   ├── graphics.html
│   └── starter-map.html
├── tool_get_location_from_arcgis/
│   ├── app.js
│   ├── index.html
│   └── styles.css
```

## 2. Hướng dẫn chạy project
- git clone https://github.com/khailtq-0688/IE402-GIS-LAB.git
- cd IE402-GIS-LAB/lab1/
- Để chạy project, mở file map_index.html bằng trình duyệt web.
- Đảm bảo các file và thư mục liên quan đều nằm đúng vị trí như cấu trúc trên.

## 3. Giải thích công dụng các folder

- **icons/**  
  Chứa các hình ảnh icon đại diện cho các loại địa điểm (trường học, bệnh viện, công viên, ...). Dùng để hiển thị trên bản đồ.

- **location_data/**  
  Chứa dữ liệu vị trí các quận/huyện dưới dạng file JavaScript. Mỗi file lưu thông tin toạ độ, tên, và các thuộc tính liên quan của từng khu vực.

- **resourse/**  
  Chứa các file ví dụ, demo về cách sử dụng ArcGIS JS API:
  - `get-location.html`: Demo lấy tọa độ điểm bằng cách click trên bản đồ.
  - `graphic-json.html`: Demo hiển thị dữ liệu graphic từ JSON.
  - `graphics.html`: Demo tạo và hiển thị các graphic (point, polyline, polygon).
  - `starter-map.html`: Demo khởi tạo bản đồ cơ bản.

- **tool_get_location_from_arcgis/**  
  Công cụ lấy tọa độ điểm trên base map bằng cách click hoặc kéo thả.  
  - `index.html`: Giao diện chính của tool.
  - `app.js`: Xử lý logic lấy tọa độ, xuất dữ liệu.
  - `styles.css`: Định dạng giao diện tool.

## 4. Liên hệ & đóng góp

Nếu có thắc mắc hoặc muốn đóng góp, vui lòng liên hệ qua email hoặc tạo issue trên repository.
