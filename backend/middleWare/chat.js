


const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const MODEL_NAME = "gemini-1.0-pro-001";
const API_KEY = "AIzaSyBxHUOLwzLFubfUUoOhmSTVouiSxhKp4bE";

// Initialize GoogleGenerativeAI instance
const genAI = new GoogleGenerativeAI(API_KEY);

// Predefined data
const predefinedParts = [
    {text: "input: name"},
    {text: "output: EduWell"},
    {text: "input: how many courses"},
    {text: "output: 4"},
    {text: "input: Who we are"},
    {text: "output: We are offering Interactive learning courses"},
    {text: "input: What all courses"},
    {text: "output: DBMS , AI , Web Development , ML"},
    {text: "input: email"},
    {text: "output: eduwell@gmail.com"},
    {text: "input: location"},
    {text: "output: Amrita vishwa vidyapeetham"},
    {text: "input: course duration"},
    {text: "output: Refer to the course tab to know the duration about the course"},
    {text: "input: Any other course"},
    {text: "output: As of now, we are offering only those courses. We will soon reach out to you about other courses you might be interested in."},
    {text: "input: fees"},
    {text: "output: Refer to the course page to know the fee structure"},
    {text: "input: about them"},
    {text: "output: "},
    {text: "input: registration process"},
    {text: "output: Registering for a course is easy. Simply visit our website, go to the courses section, select the course you're interested in, and follow the registration instructions provided."},
    {text: "input: student support"},
    {text: "output: We offer comprehensive support to all our students. If you have any questions or concerns, feel free to reach out to us via email at eduwell@gmail.com or through our website's contact page."},
    {text: "input: course schedule"},
    {text: "output: Course schedules are flexible and vary depending on the course you choose. You can find detailed schedule information for each course on our website."},
    {text: "input: About the institution"},
    {text: "output: EduWell is committed to providing a transformative learning experience to students worldwide. We strive to equip individuals with the skills and knowledge necessary for success in their chosen fields."},
    {text: "input: Support languages"},
    {text: "output: We offer support in multiple languages to cater to the diverse needs of our students."},
    {text: "input: Contact hours"},
    {text: "output: Our customer support team is available during business hours to assist you with any inquiries or assistance you may need."},
    {text: "input: Course accreditation"},
    {text: "output: Our courses are accredited by reputable institutions, ensuring their quality and recognition in the industry."},
    {text: "input: Refund policy"},
    {text: "output: For information regarding our refund policy, please refer to the terms and conditions outlined on our website."},
    {text: "input: Course materials"},
    {text: "output: All necessary course materials and resources are provided to students upon enrollment."},
    {text: "input: Learning outcomes"},
    {text: "output: Our courses are designed to help students achieve specific learning outcomes and acquire valuable skills applicable in real-world scenarios."},
    {text: "input: Course instructors"},
    {text: "output: Our courses are taught by experienced instructors who are experts in their respective fields."},
    {text: "input: Course format"},
    {text: "output: Courses are offered in various formats, including online lectures, interactive sessions, and practical exercises."},
    {text: "input: Enrollment deadlines"},
    {text: "output: Enrollment deadlines for courses are specified on our website. Be sure to check the course page for more details."},
    {text: "input: Course prerequisites"},
    {text: "output: Certain courses may have prerequisites. Please review the course details on our website to ensure you meet the requirements before enrolling."},
    {text: "input: Course certifications"},
    {text: "output: Upon successful completion of a course, students will receive a certificate to validate their achievement."},
    {text: "input: Course curriculum"},
    {text: "output: Our courses feature comprehensive curricula designed to cover all relevant topics and skills."},
    {text: "input: Career prospects"},
    {text: "output: Our courses are designed to enhance career prospects and open up new opportunities for students in their respective fields."},
    {text: "input: Online learning platform"},
    {text: "output: We offer a user-friendly online learning platform that allows students to access course materials and engage with instructors and peers."},
    {text: "input: Student feedback"},
    {text: "output: We value student feedback and continuously strive to improve our courses based on the suggestions and experiences shared by our students."},
    {text: "input: Alumni network"},
    {text: "output: Join our alumni network to connect with other graduates and gain access to exclusive networking opportunities and resources."},
    {text: "input: Course updates"},
    {text: "output: Stay updated with the latest course developments and announcements by subscribing to our newsletter or following us on social media."},
    {text: "input: Technical requirements"},
    {text: "output: Check the technical requirements section on our website to ensure your device meets the specifications for accessing our online courses."}
];

async function generateResponse(userInput) {
    try {
        // Get generative model
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Combine user input with predefined data
        const combinedParts = [...predefinedParts, { text: `input: ${userInput}` }];

        // Define generation configuration and safety settings
        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        // Generate response based on user input and predefined data
        const result = await model.generateContent({
            contents: [{ role: "user", parts: combinedParts }],
            generationConfig,
            safetySettings,
        });

        // Extract and return the response
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating response:", error);
        return "An error occurred while generating response";
    }
}

module.exports = generateResponse;