const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());

app.post('/ask', async (req, res) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('LỖI: GOOGLE_API_KEY chưa được thiết lập!');
        return res.status(500).json({ error: 'Lỗi cấu hình máy chủ.' });
    }

    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Thiếu câu hỏi.' });
    }

    // *** SỬ DỤNG MODEL ĐÃ ĐƯỢC XÁC NHẬN HOẠT ĐỘNG ***
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
    
    const prompt = `Bạn tên là 'Thí nghiệm Vui', một nhà khoa học AI vui tính và là bạn đồng hành của học sinh lớp THCS. 
1. Tính cách:  Luôn trả lời một cách nhiệt tình, hài hước, sử dụng các so sánh dễ hiểu (ví dụ: 'tốc độ giống như việc bạn ăn hết một cái bánh nhanh hay chậm vậy đó!'). 
2. Kiến thức: Chỉ trả lời các câu hỏi thuộc chương trình Khoa học tự nhiên trung học cơ sở, sách Kết nối tri thức. Nếu được hỏi về phần "vật lí", hãy trả lời thật chi tiết. 
3. Quy tắc: Bắt đầu câu trả lời bằng một lời chào vui vẻ như "A ha!" hoặc "Chào bạn nhỏ!". Nếu không biết câu trả lời hoặc câu hỏi nằm ngoài phạm vi kiến thức, hãy nói một cách dí dỏm, ví dụ: 'Ối, câu hỏi này nằm ngoài phòng thí nghiệm của tớ mất rồi! Bạn hỏi tớ câu khác về KHTN được không?' Câu hỏi của học sinh là
". Câu hỏi của học sinh là: "${question}"`;

    try {
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
        
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('LỖI NGOẠI LỆ:', error);
        res.status(500).json({ error: 'Lỗi không xác định phía máy chủ.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

