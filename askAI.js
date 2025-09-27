const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Sử dụng middleware để đọc JSON và cho phép CORS
app.use(express.json());
app.use(cors());

// Tạo một "cổng" để nhận yêu cầu từ trang web học liệu
app.post('/ask', async (req, res) => {
    // 1. KIỂM TRA CẤU HÌNH VÀ DỮ LIỆU ĐẦU VÀO
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('LỖI: GOOGLE_API_KEY chưa được thiết lập!');
        return res.status(500).json({ error: 'Lỗi cấu hình máy chủ.' });
    }

    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Thiếu câu hỏi.' });
    }

    // 2. GỌI API CỦA GOOGLE
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    const prompt = `Bạn là một trợ giảng AI, chỉ trả lời các câu hỏi liên quan đến bài học "Đo tốc độ" dành cho học sinh lớp 7 một cách ngắn gọn, dễ hiểu. Nếu câu hỏi không liên quan, hãy trả lời rằng "Câu hỏi này nằm ngoài phạm vi bài học Đo tốc độ, bạn có câu hỏi nào khác không?". Câu hỏi của học sinh là: "${question}"`;

    try {
        const fetch = (await import('node-fetch')).default;
        const googleResponse = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!googleResponse.ok) {
            const errorData = await googleResponse.json();
            console.error('Lỗi từ Google API:', errorData);
            return res.status(googleResponse.status).json({ error: 'Lỗi từ Google AI API.' });
        }

        const data = await googleResponse.json();

        if (!data.candidates || data.candidates.length === 0) {
            return res.json({ answer: "Rất tiếc, tôi không thể trả lời câu hỏi này do bộ lọc an toàn." });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // 3. GỬI PHẢN HỒI THÀNH CÔNG
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('LỖI NGOẠI LỆ:', error);
        res.status(500).json({ error: 'Lỗi không xác định phía máy chủ.' });
    }
});

// Khởi động máy chủ
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});