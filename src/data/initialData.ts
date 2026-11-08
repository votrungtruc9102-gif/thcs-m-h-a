import { SubjectConfig, Topic, Lesson, Question, TermPair, DocumentItem } from '../types';

export const SUBJECTS: SubjectConfig[] = [
  {
    id: 'tin_hoc',
    name: 'Tin học',
    iconName: 'Laptop',
    color: '#2684FF',
    bgLight: '#EFF6FF',
    borderColor: '#BFDBFE',
    description: 'Chinh phục thế giới số, lập trình, công nghệ thông tin và trí tuệ nhân tạo.',
    hasContent: true,
  },
  {
    id: 'toan',
    name: 'Toán học',
    iconName: 'Calculator',
    color: '#F59E0B',
    bgLight: '#FFFBEB',
    borderColor: '#FDE68A',
    description: 'Số học, hình học trực quan, đại số và tư duy logic phản biện.',
    hasContent: true,
  },
  {
    id: 'ngu_van',
    name: 'Ngữ văn',
    iconName: 'BookOpen',
    color: '#EC4899',
    bgLight: '#FDF2F8',
    borderColor: '#FBCFE8',
    description: 'Khám phá văn học, rèn luyện kỹ năng đọc hiểu và viết văn sáng tạo.',
    hasContent: true,
  },
  {
    id: 'tieng_anh',
    name: 'Tiếng Anh',
    iconName: 'Languages',
    color: '#10B981',
    bgLight: '#ECFDF5',
    borderColor: '#A7F3D0',
    description: 'Tiếng Anh giao tiếp chuẩn quốc tế, ngữ pháp và từ vựng mở rộng.',
    hasContent: true,
  },
  {
    id: 'khoa_hoc_tu_nhien',
    name: 'Khoa học tự nhiên',
    iconName: 'Atom',
    color: '#8B5CF6',
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
    description: 'Khám phá Vật lý, Hóa học, Sinh học và thế giới tự nhiên kỳ thú.',
    hasContent: true,
  },
  {
    id: 'lich_su_dia_li',
    name: 'Lịch sử và Địa lí',
    iconName: 'Compass',
    color: '#F97316',
    bgLight: '#FFF7ED',
    borderColor: '#FED7AA',
    description: 'Tìm hiểu cội nguồn lịch sử dân tộc, địa lý thế giới và Việt Nam.',
    hasContent: false,
  },
  {
    id: 'cong_nghe',
    name: 'Công nghệ',
    iconName: 'Cpu',
    color: '#06B6D4',
    bgLight: '#ECFEFF',
    borderColor: '#A5F3FC',
    description: 'Công nghệ đời sống, nông nghiệp công nghệ cao và thiết kế kỹ thuật.',
    hasContent: false,
  },
  {
    id: 'giao_duc_cong_dan',
    name: 'Giáo dục công dân',
    iconName: 'ShieldCheck',
    color: '#14B8A6',
    bgLight: '#F0FDFA',
    borderColor: '#99F6E4',
    description: 'Bồi dưỡng đạo đức, lối sống, trách nhiệm và hiểu biết pháp luật.',
    hasContent: false,
  },
];

export const GRADES = [
  { id: '6', name: 'Lớp 6', badge: 'Khối 6', desc: 'Làm quen môi trường THCS, kiến thức nền tảng vững vàng', icon: 'GraduationCap' },
  { id: '7', name: 'Lớp 7', badge: 'Khối 7', desc: 'Mở rộng tư duy logic, kỹ năng số và ứng dụng thực tiễn', icon: 'Award' },
  { id: '8', name: 'Lớp 8', badge: 'Khối 8', desc: 'Nâng cao kỹ năng chuyên sâu, tư duy thuật toán và khoa học', icon: 'Sparkles' },
  { id: '9', name: 'Lớp 9', badge: 'Khối 9', desc: 'Tổng ôn luyện toàn diện, sẵn sàng chuyển cấp vào THPT', icon: 'Compass' },
];

export const INITIAL_TOPICS: Topic[] = [
  // Grade 6 - Tin học
  {
    id: 'top_tin6_1',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Chủ đề 1: Máy tính và cộng đồng',
    description: 'Tìm hiểu về thông tin, dữ liệu và các bước trong hoạt động xử lý thông tin của máy tính.',
    order: 1,
    icon: 'Monitor',
  },
  {
    id: 'top_tin6_2',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Chủ đề 2: Mạng máy tính và Internet',
    description: 'Cấu tạo mạng máy tính, mạng có dây, không dây và lợi ích của thế giới Internet.',
    order: 2,
    icon: 'Globe',
  },
  {
    id: 'top_tin6_3',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Chủ đề 3: Tổ chức lưu trữ và tìm kiếm thông tin',
    description: 'Kỹ năng tìm kiếm dữ liệu trên Internet, sử dụng công cụ tìm kiếm và thư điện tử an toàn.',
    order: 3,
    icon: 'FolderSearch',
  },
  {
    id: 'top_tin6_4',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Chủ đề 4: Đạo đức, pháp luật & Văn hóa số',
    description: 'Bảo vệ bản quyền, an toàn thông tin cá nhân và ứng xử văn minh trong không gian mạng.',
    order: 4,
    icon: 'Shield',
  },
  {
    id: 'top_tin6_5',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Chủ đề 5: Lập trình trực quan & Ứng dụng',
    description: 'Làm quen với thuật toán, sơ đồ khối và phần mềm lập trình trực quan Scratch.',
    order: 5,
    icon: 'Code2',
  },

  // Grade 7 - Tin học
  {
    id: 'top_tin7_1',
    subjectId: 'tin_hoc',
    gradeId: '7',
    title: 'Chủ đề 1: Máy tính và thiết bị vào - ra',
    description: 'Phân loại thiết bị vào ra, cổng kết nối và các thiết bị số thông minh hiện đại.',
    order: 1,
    icon: 'HardDrive',
  },
  {
    id: 'top_tin7_2',
    subjectId: 'tin_hoc',
    gradeId: '7',
    title: 'Chủ đề 2: Bảng tính điện tử (Spreadsheet)',
    description: 'Thu thập, xử lý số liệu và trực quan hóa dữ liệu bằng biểu đồ trên phần mềm bảng tính.',
    order: 2,
    icon: 'Table',
  },

  // Grade 8 - Tin học
  {
    id: 'top_tin8_1',
    subjectId: 'tin_hoc',
    gradeId: '8',
    title: 'Chủ đề 1: Thuật toán và cấu trúc rẽ nhánh',
    description: 'Phân tích bài toán, thuật toán tìm kiếm, sắp xếp và lập trình điều khiển.',
    order: 1,
    icon: 'Workflow',
  },

  // Grade 9 - Tin học
  {
    id: 'top_tin9_1',
    subjectId: 'tin_hoc',
    gradeId: '9',
    title: 'Chủ đề 1: Mạng xã hội, AI và Định hướng nghề nghiệp',
    description: 'Tác động của trí tuệ nhân tạo, an toàn thông tin nâng cao và ngành nghề CNTT trong tương lai.',
    order: 1,
    icon: 'Bot',
  },

  // Grade 6 - Toán học
  {
    id: 'top_toan6_1',
    subjectId: 'toan',
    gradeId: '6',
    title: 'Chủ đề 1: Số tự nhiên và Số nguyên',
    description: 'Tập hợp các số tự nhiên, các phép tính luỹ thừa, chia hết và tập hợp số nguyên.',
    order: 1,
    icon: 'Hash',
  },

  // Grade 6 - Tiếng Anh
  {
    id: 'top_eng6_1',
    subjectId: 'tieng_anh',
    gradeId: '6',
    title: 'Unit 1: My New School',
    description: 'School subjects, facilities, simple present tense and daily school routines.',
    order: 1,
    icon: 'BookMarked',
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  // Tin học 6 - Bài 1
  {
    id: 'les_tin6_1',
    topicId: 'top_tin6_1',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Bài 1: Thông tin và dữ liệu trong kỷ nguyên số',
    order: 1,
    objectives: [
      'Phân biệt được thông tin và dữ liệu, mối quan hệ giữa chúng.',
      'Nêu được ví dụ minh họa về thông tin và dữ liệu trong thực tế học tập.',
      'Hiểu được tầm quan trọng của việc thu nhận và xử lý thông tin đúng đắn.',
    ],
    coreKnowledge: `
1. Khái niệm Thông tin và Dữ liệu:
- Dữ liệu (Data): Là các con số, văn bản, hình ảnh, âm thanh,... được thu thập hoặc ghi lại và có thể lưu trữ trong máy tính.
- Thông tin (Information): Là sự hiểu biết của con người sau khi tiếp nhận và xử lý dữ liệu. Thông tin giúp con người đưa ra quyết định chính xác.

2. Mối quan hệ mật thiết:
- Dữ liệu là nguyên liệu đầu vào.
- Sau khi được não bộ hoặc máy tính phân tích, dữ liệu biến thành thông tin hữu ích.
- Ví dụ: Con số "39°C" trên nhiệt kế là dữ liệu; thông tin rút ra là "Học sinh đang bị sốt cao cần nghỉ ngơi và uống thuốc".

3. Tầm quan trọng của thông tin trong thời đại 4.0:
- Thông tin đầy đủ, kịp thời và chính xác giúp ta học tập hiệu quả, tránh tin giả (fake news) và định hướng tương lai.
    `,
    examples: [
      'Ví dụ 1: Tiếng chuông reo "Tùng! Tùng! Tùng!" là dữ liệu âm thanh; thông tin thu nhận là "Đã đến giờ vào lớp".',
      'Ví dụ 2: Bảng điểm gồm các con số (Toán: 9.0, Tin: 9.5) là dữ liệu; thông tin là "Em đạt học lực xuất sắc".',
    ],
    reviewQuestions: [
      {
        question: 'Dữ liệu được lưu trữ trong máy tính dưới dạng nào?',
        answer: 'Dữ liệu được lưu trữ dưới dạng các dãy bit (gồm các chữ số 0 và 1).',
      },
      {
        question: 'Hãy phân biệt dữ liệu và thông tin bằng một ví dụ thực tế?',
        answer: 'Biển báo giao thông hình tròn viền đỏ có số 50 là dữ liệu hình ảnh. Thông tin là đoạn đường này giới hạn tốc độ tối đa 50 km/h.',
      },
    ],
    references: ['Sách giáo khoa Tin học 6 - Bộ sách Kết nối tri thức với cuộc sống', 'Giáo trình trường THCS Mỹ Hòa'],
  },

  // Tin học 6 - Bài 2
  {
    id: 'les_tin6_2',
    topicId: 'top_tin6_1',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Bài 2: Xử lý thông tin và các thành phần của máy tính',
    order: 2,
    objectives: [
      'Nhận biết 4 bước cơ bản của quá trình xử lý thông tin.',
      'Kể tên các thiết bị vào, thiết bị ra, khối xử lý và khối lưu trữ của máy vi tính.',
      'Giải thích được cách máy tính trợ giúp con người trong học tập và đời sống.',
    ],
    coreKnowledge: `
1. Mô hình bốn bước xử lý thông tin:
- Bước 1: Thu nhận thông tin (Input) - ví dụ nghe, nhìn, bấm phím.
- Bước 2: Lưu trữ thông tin (Storage) - ghi nhớ vào não bộ hoặc ổ cứng, thẻ nhớ.
- Bước 3: Xử lý thông tin (Processing) - suy nghĩ, tính toán, so sánh bởi CPU.
- Bước 4: Truyền / Xuất thông tin (Output) - phát biểu, in ấn, hiển thị lên màn hình.

2. Cấu trúc phần cứng máy vi tính:
- Thiết bị vào (Input devices): Bàn phím (Keyboard), Chuột (Mouse), Máy quét (Scanner), Micro, Camera.
- Thiết bị xử lý (CPU - Central Processing Unit): "Bộ não" tính toán và điều khiển toàn bộ hệ thống.
- Thiết bị lưu trữ (Storage): RAM (bộ nhớ tạm), Ổ cứng SSD/HDD, USB, thẻ nhớ.
- Thiết bị ra (Output devices): Màn hình (Monitor), Máy in (Printer), Loa (Speaker).
    `,
    examples: [
      'Ví dụ: Bạn học sinh nghe thầy đọc đề bài (Vào) -> Viết tóm tắt ra nháp (Lưu trữ) -> Suy nghĩ lời giải (Xử lý) -> Đứng lên trả lời (Ra).',
    ],
    reviewQuestions: [
      {
        question: 'Bộ phận nào được coi là "bộ não" điều khiển mọi hoạt động của máy tính?',
        answer: 'Bộ vi xử lý trung tâm (CPU - Central Processing Unit).',
      },
      {
        question: 'Màn hình máy tính thuộc nhóm thiết bị nào trong quy trình xử lý thông tin?',
        answer: 'Thiết bị ra (Output device).',
      },
    ],
    references: ['Chương trình Giáo dục phổ thông 2018 - Môn Tin học THCS'],
  },

  // Tin học 6 - Bài 3 (Topic 2 - Mạng máy tính)
  {
    id: 'les_tin6_3',
    topicId: 'top_tin6_2',
    subjectId: 'tin_hoc',
    gradeId: '6',
    title: 'Bài 3: Mạng máy tính và các thành phần kết nối',
    order: 1,
    objectives: [
      'Nêu được khái niệm mạng máy tính và lợi ích to lớn của mạng.',
      'Nhận biết các thành phần mạng: thiết bị đầu cuối, thiết bị kết nối và phần mềm mạng.',
      'Phân biệt được mạng có dây (Ethernet) và mạng không dây (Wi-Fi).',
    ],
    coreKnowledge: `
1. Khái niệm Mạng máy tính:
- Mạng máy tính là một tập hợp các máy tính và thiết bị được kết nối với nhau để chia sẻ dữ liệu, tài nguyên và dịch vụ.

2. Lợi ích của mạng máy tính:
- Chia sẻ tệp tin, dữ liệu học tập nhanh chóng chỉ trong tích tắc.
- Dùng chung thiết bị đắt tiền (máy in, máy quét, ổ lưu trữ đám mây).
- Trao đổi thông tin, họp trực tuyến, học từ xa xuyên lục địa.

3. Ba thành phần chính:
- Thiết bị đầu cuối (End Devices): Máy tính để bàn, máy tính bảng, điện thoại di động, máy in mạng.
- Thiết bị kết nối (Network Devices): Cáp mạng (LAN cable), Router (bộ định tuyến), Switch (bộ chuyển mạch), Bộ phát Wi-Fi (Access Point).
- Phần mềm mạng (Network Software): Trình duyệt web, ứng dụng chat, giao thức truyền dữ liệu.
    `,
    examples: [
      'Ví dụ: Phòng máy tính THCS Mỹ Hòa có 40 máy nối với 1 máy in qua cổng mạng trường học; giáo viên và học sinh đều có thể gửi lệnh in tài liệu.',
    ],
    reviewQuestions: [
      {
        question: 'Thiết bị nào sau đây KHÔNG phải là thiết bị đầu cuối: Laptop, Điện thoại, Bộ chia mạng Switch, Máy in?',
        answer: 'Bộ chia mạng (Switch) là thiết bị kết nối, không phải thiết bị đầu cuối.',
      },
    ],
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // Question 1 - Tin 6
  {
    id: 'q_tin6_01',
    code: 'TH6_01',
    content: 'Dữ liệu được lưu trữ trong máy tính số dưới dạng nào sau đây?',
    options: [
      { id: 'A', text: 'Dãy các chữ cái từ A đến Z' },
      { id: 'B', text: 'Dãy các bit gồm số 0 và 1' },
      { id: 'C', text: 'Các hình ảnh và màu sắc nguyên bản' },
      { id: 'D', text: 'Sóng âm thanh cơ học' },
    ],
    correctAnswer: 'B',
    explanation: 'Trong máy tính điện tử, mọi thông tin (văn bản, âm thanh, hình ảnh) đều được mã hóa thành các dãy bit (nhị phân) chỉ gồm ký hiệu 0 và 1.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_1',
    cognitiveLevel: 'nhan_biet',
    source: 'Ngân hàng câu hỏi Tin học 6 - THCS Mỹ Hòa',
  },
  // Question 2 - Tin 6
  {
    id: 'q_tin6_02',
    code: 'TH6_02',
    content: 'Một bạn học sinh đọc biển báo giao thông "Cấm rẽ trái" và đi thẳng. Hành động "đi thẳng" thuộc bước nào trong quá trình xử lý thông tin?',
    options: [
      { id: 'A', text: 'Thu nhận thông tin' },
      { id: 'B', text: 'Lưu trữ thông tin' },
      { id: 'C', text: 'Xử lý thông tin' },
      { id: 'D', text: 'Truyền / Xuất kết quả thông tin (Hành động)' },
    ],
    correctAnswer: 'D',
    explanation: 'Việc nhìn thấy biển là thu nhận thông tin; suy nghĩ quy tắc là xử lý; hành động đi thẳng là kết quả/xuất quyết định xử lý ra thực tế.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_1',
    cognitiveLevel: 'thong_hieu',
    source: 'Đề kiểm tra định kỳ Tin 6',
  },
  // Question 3 - Tin 6
  {
    id: 'q_tin6_03',
    code: 'TH6_03',
    content: 'Thiết bị nào sau đây đóng vai trò là "bộ não" điều khiển và thực hiện các phép tính của máy tính?',
    options: [
      { id: 'A', text: 'Màn hình (Monitor)' },
      { id: 'B', text: 'Bàn phím (Keyboard)' },
      { id: 'C', text: 'Bộ xử lý trung tâm (CPU)' },
      { id: 'D', text: 'Chuột quang (Mouse)' },
    ],
    correctAnswer: 'C',
    explanation: 'CPU (Central Processing Unit) là bộ vi xử lý trung tâm có chức năng thực hiện các lệnh và điều phối toàn bộ hệ thống máy tính.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_1',
    cognitiveLevel: 'nhan_biet',
    source: 'Sách giáo khoa Tin học 6',
  },
  // Question 4 - Tin 6
  {
    id: 'q_tin6_04',
    code: 'TH6_04',
    content: 'Nhóm thiết bị nào sau đây CHỈ GỒM các thiết bị vào (Input Devices)?',
    options: [
      { id: 'A', text: 'Bàn phím, Chuột, Máy quét (Scanner), Micro' },
      { id: 'B', text: 'Màn hình, Máy in, Loa, Tai nghe' },
      { id: 'C', text: 'Bàn phím, Màn hình, Chuột, Máy in' },
      { id: 'D', text: 'Ổ cứng SSD, Chuột, Tai nghe, Micro' },
    ],
    correctAnswer: 'A',
    explanation: 'Bàn phím, chuột, máy quét và micro đều là các thiết bị dùng để nhập dữ liệu vào máy tính.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_1',
    cognitiveLevel: 'thong_hieu',
    source: 'Ngân hàng câu hỏi Tin học 6 - THCS Mỹ Hòa',
  },
  // Question 5 - Tin 6
  {
    id: 'q_tin6_05',
    code: 'TH6_05',
    content: 'Phát biểu nào sau đây nêu ĐÚNG nhất về khái niệm Mạng máy tính?',
    options: [
      { id: 'A', text: 'Mạng máy tính là một chiếc máy vi tính cấu hình rất mạnh và hiện đại' },
      { id: 'B', text: 'Mạng máy tính là tập hợp các máy tính được nối với nhau để chia sẻ dữ liệu và tài nguyên' },
      { id: 'C', text: 'Mạng máy tính là mạng lưới dây điện cấp nguồn cho các máy tính' },
      { id: 'D', text: 'Mạng máy tính chỉ có thể kết nối được tối đa 5 máy tính' },
    ],
    correctAnswer: 'B',
    explanation: 'Mạng máy tính là hệ thống kết nối nhiều thiết bị với nhau bằng các phương tiện truyền dẫn nhằm trao đổi thông tin và chia sẻ tài nguyên phần cứng, phần mềm.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_2',
    cognitiveLevel: 'nhan_biet',
    source: 'Đề kiểm tra giữa kỳ 1 Tin 6',
  },
  // Question 6 - Tin 6 (Vận dụng)
  {
    id: 'q_tin6_06',
    code: 'TH6_06',
    content: 'Em muốn gửi một bức tranh số vẽ bằng máy tính cho bạn ở xa một cách nhanh chóng và tiết kiệm chi phí nhất, em nên dùng phương thức nào?',
    options: [
      { id: 'A', text: 'Chép ra đĩa CD rồi gửi qua đường bưu điện' },
      { id: 'B', text: 'In ra giấy rồi đem đến tận nhà bạn' },
      { id: 'C', text: 'Gửi qua thư điện tử (Email) hoặc ứng dụng nhắn tin trực tuyến' },
      { id: 'D', text: 'Lưu vào USB rồi nhờ người chuyển xe khách' },
    ],
    correctAnswer: 'C',
    explanation: 'Sử dụng Internet và thư điện tử giúp truyền tệp kỹ thuật số tức thì, không tốn chi phí đi lại và đảm bảo nguyên vẹn chất lượng tệp tranh.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_3',
    cognitiveLevel: 'van_dung',
    source: 'Bài tập tình huống Tin học 6',
  },
  // Question 7 - Tin 6 (Vận dụng cao)
  {
    id: 'q_tin6_07',
    code: 'TH6_07',
    content: 'Khi gặp một tin tức lạ giật gân trên mạng xã hội chưa rõ nguồn gốc, học sinh THCS Mỹ Hòa nên làm gì để thể hiện văn hóa số văn minh?',
    options: [
      { id: 'A', text: 'Ngay lập tức chia sẻ (Share) để mọi người cùng hoang mang' },
      { id: 'B', text: 'Kiểm chứng từ các trang báo chính thống, hỏi thầy cô và không chia sẻ tin sai sự thật' },
      { id: 'C', text: 'Bình luận công kích và dùng lời lẽ thiếu tế nhị' },
      { id: 'D', text: 'Tải về gửi vào tất cả các nhóm học tập' },
    ],
    correctAnswer: 'B',
    explanation: 'Quy tắc ứng xử văn minh trong môi trường số đòi hỏi kiểm chứng nguồn tin chính thống, không tiếp tay lan truyền tin giả (fake news) độc hại.',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_4',
    cognitiveLevel: 'van_dung_cao',
    source: 'Chủ đề 4 - Văn hóa số THCS',
  },

  // Question 8 - Tin 7
  {
    id: 'q_tin7_01',
    code: 'TH7_01',
    content: 'Trong phần mềm bảng tính Excel, địa chỉ của ô nằm ở cột C và hàng 5 được viết là gì?',
    options: [
      { id: 'A', text: '5C' },
      { id: 'B', text: 'C5' },
      { id: 'C', text: 'C:5' },
      { id: 'D', text: '=C5' },
    ],
    correctAnswer: 'B',
    explanation: 'Địa chỉ ô trong bảng tính luôn gồm tên cột (chữ cái) trước, tên hàng (chữ số) sau, ví dụ C5.',
    subjectId: 'tin_hoc',
    gradeId: '7',
    topicId: 'top_tin7_2',
    cognitiveLevel: 'nhan_biet',
    source: 'Ngân hàng câu hỏi Tin học 7',
  },

  // Question 9 - Toán 6
  {
    id: 'q_toan6_01',
    code: 'TO6_01',
    content: 'Tập hợp các ước tự nhiên của số 12 gồm các phần tử nào sau đây?',
    options: [
      { id: 'A', text: '{1; 2; 3; 4; 6; 12}' },
      { id: 'B', text: '{0; 1; 2; 3; 4; 6; 12}' },
      { id: 'C', text: '{2; 3; 4; 6}' },
      { id: 'D', text: '{1; 2; 3; 4; 6; 8; 12}' },
    ],
    correctAnswer: 'A',
    explanation: 'Các số tự nhiên mà 12 chia hết là 1, 2, 3, 4, 6 và 12.',
    subjectId: 'toan',
    gradeId: '6',
    topicId: 'top_toan6_1',
    cognitiveLevel: 'nhan_biet',
    source: 'Đề ôn tập Toán 6 - THCS Mỹ Hòa',
  },

  // Question 10 - Tiếng Anh 6
  {
    id: 'q_eng6_01',
    code: 'EN6_01',
    content: 'Choose the correct form: "Nam ______ to school by bicycle every morning."',
    options: [
      { id: 'A', text: 'go' },
      { id: 'B', text: 'goes' },
      { id: 'C', text: 'going' },
      { id: 'D', text: 'went' },
    ],
    correctAnswer: 'B',
    explanation: 'Chủ ngữ "Nam" là ngôi thứ 3 số ít, động từ "go" ở thì Hiện tại đơn chia thêm "es" thành "goes".',
    subjectId: 'tieng_anh',
    gradeId: '6',
    topicId: 'top_eng6_1',
    cognitiveLevel: 'thong_hieu',
    source: 'English Grade 6 - Unit 1 Test',
  },
];

export const INITIAL_TERM_PAIRS: TermPair[] = [
  { id: 'tp1', term: 'CPU', definition: 'Bộ vi xử lý trung tâm, "bộ não" điều khiển máy tính', category: 'Phần cứng' },
  { id: 'tp2', term: 'RAM', definition: 'Bộ nhớ tạm thời bị xóa sạch khi mất nguồn điện', category: 'Phần cứng' },
  { id: 'tp3', term: 'Router', definition: 'Thiết bị định tuyến truyền gói tin qua mạng Internet', category: 'Mạng' },
  { id: 'tp4', term: 'Bit', definition: 'Đơn vị đo lường thông tin nhỏ nhất (0 hoặc 1)', category: 'Dữ liệu' },
  { id: 'tp5', term: 'Browser', definition: 'Trình duyệt web dùng để xem các trang Internet', category: 'Phần mềm' },
  { id: 'tp6', term: 'SSD', definition: 'Ổ đĩa thể rắn lưu trữ dữ liệu bền vững và tốc độ cao', category: 'Lưu trữ' },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    fileName: 'SGK_TinHoc6_KetNoiTriThuc.pdf',
    fileSize: 12450000,
    fileType: 'pdf',
    title: 'Sách giáo khoa Tin học 6 - Kết nối tri thức',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_1',
    schoolYear: '2026-2027',
    source: 'Bộ Giáo dục & Đào tạo',
    notes: 'Tài liệu chuẩn dùng trong giảng dạy tại trường THCS Mỹ Hòa.',
    uploadedBy: 'Thầy Nguyễn Văn Nam (Tổ Tin học)',
    uploadedAt: '2026-09-05T08:00:00Z',
    status: 'teacher_verified',
    textSnippet: 'Chương trình Tin học 6 bao gồm 6 chủ đề chính: Máy tính và cộng đồng, Mạng máy tính và Internet...',
  },
  {
    id: 'doc_2',
    fileName: 'DeCuong_OnTap_HocKy1_TinHoc6.docx',
    fileSize: 450000,
    fileType: 'docx',
    title: 'Đề cương ôn tập Học kỳ 1 - Môn Tin học 6',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_1',
    schoolYear: '2026-2027',
    source: 'Tổ Chuyên môn Tin học THCS Mỹ Hòa',
    notes: 'Tổng hợp 50 câu hỏi trắc nghiệm và 5 bài tập thực hành máy tính.',
    uploadedBy: 'Cô Trần Thị Lan',
    uploadedAt: '2026-10-15T14:30:00Z',
    status: 'teacher_verified',
    textSnippet: 'I. Lý thuyết: 1. Thông tin và dữ liệu. 2. Các thiết bị vào ra. II. Bài tập tình huống...',
  },
  {
    id: 'doc_3',
    fileName: 'SoDoTuDuy_MangMayTinh.pptx',
    fileSize: 2800000,
    fileType: 'pptx',
    title: 'Bài giảng trình chiếu & Sơ đồ tư duy: Mạng máy tính',
    subjectId: 'tin_hoc',
    gradeId: '6',
    topicId: 'top_tin6_2',
    schoolYear: '2026-2027',
    source: 'Thư viện bài giảng số THCS Mỹ Hòa',
    notes: 'Slide hình ảnh trực quan sinh động minh họa mạng LAN, WAN và Wi-Fi.',
    uploadedBy: 'Thầy Lê Hoàng Long',
    uploadedAt: '2026-10-20T09:15:00Z',
    status: 'processed',
  },
];
