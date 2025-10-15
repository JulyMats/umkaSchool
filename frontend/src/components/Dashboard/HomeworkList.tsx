import { BookOpen } from 'lucide-react';

export default function HomeworkList() {
  const homework = [
    { title: "Addition and Subtraction Practice", due: "Due tomorrow" },
    { title: "Multiplication Tables (2–5)", due: "Due in 3 days" },
    { title: "Mental Division Techniques", due: "Due in 5 days" },
  ];

  return (
    <div className="bg-pink-50 p-4 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-pink-700 flex items-center gap-2">
          <div className="bg-pink-100 p-1.5 rounded-full aspect-square flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-pink-700" />
          </div>
          Homework assigned to you
        </h3>
        <a href="#" className="text-sm text-pink-600 font-medium">
          View all
        </a>
      </div>
      <ul>
        {homework.map((item) => (
          <li key={item.title} className="flex justify-between items-center bg-pink-100 p-3 rounded-xl mb-2">
            <div className="text-left">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500">{item.due}</p>
            </div>
            <button className="bg-pink-500 text-white px-4 py-1 rounded-lg text-sm">Start</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
