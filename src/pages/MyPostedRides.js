import React, { useEffect, useState } from "react";
import styled from "styled-components";

const MyPostedRides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const fetchActive = async () => {
        setErr("");
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            // Use the active-only endpoint
            const res = await fetch("/api/users/me/rides/active", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load rides");
            setRides(data.rides || []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    const startRide = async (rideId) => {
        await updateStatus(rideId, "ongoing");
    };

    const completeRide = async (rideId) => {
        // Optimistically remove from list so it disappears right away
        setRides((prev) => prev.filter((r) => r._id !== rideId));
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`/api/rides/${rideId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "completed" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to complete ride");
            // No need to re-add; this page shows only active rides
            // Optionally notify: toast.success("Ride moved to history");
        } catch (e) {
            // Revert on error if needed, or refetch
            setErr(e.message);
            await fetchActive();
        }
    };

    const updateStatus = async (rideId, status) => {
        setErr("");
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`/api/rides/${rideId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update status");
            setRides((prev) => prev.map((r) => (r._id === rideId ? data.ride : r)));
        } catch (e) {
            setErr(e.message);
        }
    };

    useEffect(() => {
        fetchActive();
    }, []);

    return (
        <Container>
            <Header>
                <Title>My Posted Rides</Title>
                <Subtitle>Active rides only. Completed rides appear in Ride History.</Subtitle>
            </Header>

            {loading && <Info>Loading your rides...</Info>}
            {err && <Error>{err}</Error>}
            {!loading && !err && rides.length === 0 && (
                <Empty>No active rides right now.</Empty>
            )}

            <List>
                {rides.map((ride) => {
                    const dt = new Date(ride.date);
                    const status = ride.status || "posted";
                    const canStart = status === "posted";
                    const canComplete = status === "ongoing";

                    return (
                        <Card key={ride._id}>
                            <Top>
                                <RouteText><b>{ride.from}</b> → <b>{ride.to}</b></RouteText>
                                <Chip status={status}>{status}</Chip>
                            </Top>

                            <Meta>
                                <span>{dt.toLocaleDateString()}</span>
                                <span>
                                    {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span>Seats: {ride.seatsAvailable}</span>
                                <span>₹{ride.pricePerSeat}</span>
                            </Meta>

                            <Actions>
                                <Primary disabled={!canStart} onClick={() => startRide(ride._id)}>
                                    Start Ride
                                </Primary>
                                <Secondary disabled={!canComplete} onClick={() => completeRide(ride._id)}>
                                    Complete Ride
                                </Secondary>
                            </Actions>
                        </Card>
                    );
                })}
            </List>
        </Container>
    );
};

export default MyPostedRides;

// Styles (lightweight)
const Container = styled.div`max-width: 950px;margin: 0 auto;padding: 10px 20px 60px;font-family: "Poppins", sans-serif;`;
const Header = styled.div`text-align: center;margin: 10px 0 24px;`;
const Title = styled.h1`color: #1e90ff;font-weight: 900;font-size: 2.2rem;margin: 0 0 6px;`;
const Subtitle = styled.p`color: #666;font-weight: 500;font-size: 1rem;margin: 0;`;
const Info = styled.p`text-align: center;color: #555;font-weight: 600;`;
const Error = styled.p`text-align: center;color: #d9534f;font-weight: 700;margin-bottom: 14px;`;
const Empty = styled.p`text-align: center;color: #777;font-weight: 600;`;
const List = styled.div`display: grid;grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));gap: 18px;`;
const Card = styled.div`background: #fff;border-radius: 14px;box-shadow: 0 12px 28px rgba(0,0,0,0.08);padding: 18px;display: flex;flex-direction: column;gap: 12px;`;
const Top = styled.div`display: flex;align-items: center;justify-content: space-between;`;
const RouteText = styled.div`color: #222;font-weight: 800;font-size: 1.05rem;`;
const Chip = styled.span`
  text-transform: capitalize;font-weight: 800;font-size: 0.85rem;padding: 6px 10px;border-radius: 999px;
  color: ${({ status }) => (status === "posted" ? "#0b74ff" : "#b76e00")};
  background: ${({ status }) => (status === "posted" ? "#e7f0ff" : "#fff3cd")};
  border: 1px solid ${({ status }) => (status === "posted" ? "#cfe1ff" : "#ffe69c")};
`;
const Meta = styled.div`display: flex;gap: 14px;flex-wrap: wrap;color: #555;font-size: 0.95rem;`;
const Actions = styled.div`display: flex;gap: 10px;`;
const Btn = styled.button`
  flex: 1;padding: 10px 14px;border: none;border-radius: 12px;font-weight: 800;font-size: 0.95rem;cursor: pointer;
  transition: background-color .2s ease, opacity .2s ease; &:disabled { opacity: .55; cursor: not-allowed; }
`;
const Primary = styled(Btn)`background-color: #1e90ff;color: #fff;&:hover:not(:disabled){background-color: #0b74ff;}`;
const Secondary = styled(Btn)`background-color: #f0f7ff;color: #005bbb;border: 1px solid #cfe1ff;&:hover:not(:disabled){background-color: #e6f0ff;}`;
