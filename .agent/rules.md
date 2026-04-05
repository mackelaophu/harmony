# Model Routing Rules
- Mặc định sử dụng **Gemini 3 Flash** cho các tác vụ giải thích code, viết CSS/HTML, và sửa lỗi cú pháp.
- Chỉ chuyển sang **Claude Sonnet 4.6 (Thinking)** khi cần suy luận logic sâu hoặc giải quyết lỗi thuật toán phức tạp.
- Chỉ dùng **Gemini 3.1 Pro (High)** khi refactor kiến trúc lớn hoặc khi các model khác không giải quyết được sau 2 lần thử.