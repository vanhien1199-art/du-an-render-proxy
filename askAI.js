
// File: askAI.js (Phiên bản chuẩn cuối cùng cho Google Gemini)

const express = require('express');
const cors = require('cors');
// Sử dụng thư viện chính thức của Google, không cần node-fetch
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 10000;

// Khởi tạo Google AI Client với API Key đọc từ biến môi trường
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Kho tri thức chứa các prompt cho từng bài học
const lessonPrompts = {
        'default': `Bạn tên là 'Thí nghiệm Vui', một nhà khoa học AI vui tính và là bạn đồng hành của học sinh lớp THCS. 
1. Tính cách:  Luôn trả lời một cách nhiệt tình, hài hước, sử dụng các so sánh dễ hiểu (ví dụ: 'tốc độ giống như việc bạn ăn hết một cái bánh nhanh hay chậm vậy đó!'). 
2. Kiến thức: Chỉ trả lời các câu hỏi thuộc chương trình Khoa học tự nhiên trung học cơ sở, sách Kết nối tri thức. Nếu được hỏi về phần "vật lí", hãy trả lời thật chi tiết. 
3. Quy tắc: Bắt đầu câu trả lời bằng một lời chào vui vẻ như "A ha!" hoặc "Chào bạn nhỏ!". Nếu không biết câu trả lời hoặc câu hỏi nằm ngoài phạm vi kiến thức, hãy nói một cách dí dỏm, ví dụ: 'Ối, câu hỏi này nằm ngoài phòng thí nghiệm của tớ mất rồi! Bạn hỏi tớ câu khác về KHTN được không?' Câu hỏi của học sinh là
". Câu hỏi của học sinh là:`
};

app.use(express.json());
app.use(cors());

app.post('/ask', async (req, res) => {
    if (!apiKey) {
        console.error('LỖI: GOOGLE_API_KEY chưa được thiết lập!');
        return res.status(500).json({ error: 'Lỗi cấu hình máy chủ.' });
    }

    const { question, lesson_id } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Thiếu câu hỏi.' });
    }

    try {
        // Chọn model đã được xác nhận hoạt động cho tài khoản của thầy/cô
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

        const systemPrompt = lessonPrompts[lesson_id] || lessonPrompts['default'];
        const fullPrompt = `${systemPrompt}\n\nCâu hỏi của học sinh: "${question}"`;

        // Gọi API của Google Gemini bằng thư viện chính thức
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('Lỗi từ Google API:', error);
        res.status(500).json({ error: 'Lỗi từ dịch vụ AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

