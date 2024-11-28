import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector((store) => store.application);
    const [aiResponse, setAiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [currentApplicant, setCurrentApplicant] = useState(null);
    const [error, setError] = useState(null);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/status/${id}/update`,
                { status }
            );
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    const askAiRecommendation = async (applicant) => {
        setIsLoading(true);
        setError(null);
        // setCurrentApplicant(applicant);
        setIsModalOpen(true);

        const apiKey =
            "";
        const apiUrl = "https://api.openai.com/v1/chat/completions";

        const prompt = `
            Evaluate the following candidate for the job position:
            Job Description: ${applicants.description}
            Candidate Bio: ${applicant.profile.bio}
            Candidate Skills: ${applicant.profile.skills.join(", ")}
            Provide a recommendation (Recommended or Not Recommended) with a brief explanation and key points.
        `;

        try {
            const response = await axios.post(
                apiUrl,
                {
                    model: "gpt-3.5-turbo", // Use the appropriate OpenAI model here
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 150, // Limit response length
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );

            const aiMessage = response.data.choices[0].message.content;
            const [recommendation, ...points] = aiMessage
                .split("\n")
                .filter((line) => line.trim() !== "");

            setAiResponse({
                recommended: recommendation.includes("Recommended"),
                description: recommendation,
                points,
            });
        } catch (error) {
            console.error("AI API Error:", error);
            setError("Failed to fetch AI recommendation. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    console.log( applicants?.applications," applicants?.applications?")
    
    return (
        <div>
            <Table>
                <TableCaption>A list of your recent applied users</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Ask AI</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants &&
                        applicants?.applications?.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>{item?.applicant?.fullname}</TableCell>
                                <TableCell>{item?.applicant?.email}</TableCell>
                                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                <TableCell>
                                    {item?.applicant?.profile?.skills?.length > 0 ? (
                                        <ul>
                                            {item.applicant.profile.skills.map((skill, index) => (
                                                <li key={index}>{skill}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span>NA</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {item?.applicant?.createdAt.split("T")[0]}
                                </TableCell>
                                <TableCell>
                                    <a href={item?.applicant?.profile?.resume} className="underline text-blue-500">Resume</a>
                                </TableCell>
                                <TableCell className="float-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            {shortlistingStatus.map((status, index) => (
                                                <div
                                                    onClick={() => statusHandler(status, item?._id)}
                                                    key={index}
                                                    className="flex w-fit items-center my-2 cursor-pointer"
                                                >
                                                    <span>{status}</span>
                                                </div>
                                            ))}
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => askAiRecommendation(item.applicant)}
                                        className="bg-gray-900 text-white px-3 py-2 rounded hover:bg-gray-600"
                                    >
                                        Ask AI
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label="Close"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center">
                                <svg
                                    className="animate-spin h-10 w-10 text-blue-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                                <p className="mt-4 text-lg text-blue-600 font-medium">
                                    Fetching AI Recommendation...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-600">
                                <p className="text-lg font-semibold mb-4">Error</p>
                                <p>{error}</p>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 focus:outline-none"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            aiResponse && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        AI Recommendation
                                    </h3>
                                    <div className="mb-4">
                                        <p className="text-lg">
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`${aiResponse.recommended
                                                    ? "text-green-600 font-semibold"
                                                    : "text-red-600 font-semibold"
                                                    }`}
                                            >
                                                {aiResponse.recommended ? "Recommended" : "Not Recommended"}
                                            </span>
                                        </p>
                                        <p className="mt-2 text-gray-600">
                                            <strong>Description:</strong> {aiResponse.description}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                            Key Points:
                                        </h4>
                                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                                            {aiResponse.points.map((point, index) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

            )}
        </div>
    );
};

export default ApplicantsTable;