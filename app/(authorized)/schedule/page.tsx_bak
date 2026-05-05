type ScheduleItem = {
    id: number;
    time: string;
    title: string;
    description: string;
    location: string;
    status: "Confirmed" | "Pending" | "Canceled";
};

const schedule: ScheduleItem[] = [
    {
        id: 1,
        time: "08:30",
        title: "Team Standup",
        description: "Daily sync with the product and engineering team.",
        location: "Zoom",
        status: "Confirmed",
    },
    {
        id: 2,
        time: "10:00",
        title: "Design Review",
        description: "Review updated scheduling flow and feedback.",
        location: "Room A-12",
        status: "Confirmed",
    },
    {
        id: 3,
        time: "13:00",
        title: "Client Check-in",
        description: "Weekly progress update and timeline discussion.",
        location: "Google Meet",
        status: "Pending",
    },
    {
        id: 4,
        time: "15:30",
        title: "Sprint Planning",
        description: "Plan tasks and priorities for the next sprint.",
        location: "Room B-04",
        status: "Confirmed",
    },
    {
        id: 5,
        time: "17:00",
        title: "1:1 Meeting",
        description: "Individual coaching and blocker review.",
        location: "Office 204",
        status: "Canceled",
    },
];

function getStatusStyles(status: ScheduleItem["status"]) {
    switch (status) {
        case "Confirmed":
            return {
                badge: "bg-green-100 text-green-700 border-green-200",
                dot: "bg-green-500",
            };
        case "Pending":
            return {
                badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
                dot: "bg-yellow-500",
            };
        case "Canceled":
            return {
                badge: "bg-red-100 text-red-700 border-red-200",
                dot: "bg-red-500",
            };
        default:
            return {
                badge: "bg-gray-100 text-gray-700 border-gray-200",
                dot: "bg-gray-500",
            };
    }
}

export default function SchedulePage() {
    const confirmedCount = schedule.filter((item) => item.status === "Confirmed").length;
    const pendingCount = schedule.filter((item) => item.status === "Pending").length;

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600">Authorized Area</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">Schedule</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Overview of today&apos;s meetings, reviews, and upcoming sessions.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                        <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
                            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Confirmed
                            </div>
                            <div className="mt-2 text-2xl font-semibold">{confirmedCount}</div>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
                            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Pending
                            </div>
                            <div className="mt-2 text-2xl font-semibold">{pendingCount}</div>
                        </div>
                    </div>
                </header>

                <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold">Today&apos;s agenda</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {schedule.map((item) => {
                            const styles = getStatusStyles(item.status);

                            return (
                                <article
                                    key={item.id}
                                    className="grid gap-4 px-6 py-5 sm:grid-cols-[96px_1fr_auto] sm:items-start"
                                >
                                    <div className="text-sm font-semibold text-gray-900">{item.time}</div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                                            <h3 className="text-base font-semibold">{item.title}</h3>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            <span className="font-medium text-gray-700">Location:</span> {item.location}
                                        </p>
                                    </div>

                                    <div
                                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${styles.badge}`}
                                    >
                                        {item.status}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}