"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";

export default function SubscriptionDetailsPage() {
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.bishwasto.xyz/subscriptions/list/", {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      })
      .then((res) => setSubscriptionList(res.data))
      .catch((err) => console.error("Error fetching list:", err));

    axios
      .get("https://api.bishwasto.xyz/subscriptions/status/", {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      })
      .then((res) => setStatus(res.data))
      .catch((err) => console.error("Error fetching status:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 grid gap-6">
      <h1 className="text-2xl font-bold mb-4">Subscription Details</h1>

      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Shop Owner:</strong> {status.is_shopOwner ? "Yes" : "No"}
            </p>
            <p>
              <strong>Trial Active:</strong>{" "}
              {status.trial.is_active ? "Yes" : "No"}
            </p>
            <p>
              <strong>Trial Period:</strong>{" "}
              {new Date(status.trial.start_date).toLocaleDateString()} -{" "}
              {new Date(status.trial.end_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Subscription Active:</strong>{" "}
              {status.is_subscription_active ? "Yes" : "No"}
            </p>
            <p>
              <strong>Subscription End Date:</strong>{" "}
              {new Date(status.subscription_end_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Shop Access:</strong>{" "}
              {status.has_shop_access ? "Granted" : "Denied"}
            </p>
          </CardContent>
        </Card>
      )}

      {subscriptionList.length > 0 &&
        subscriptionList.map((sub) => (
          <Card key={sub.id}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>
                {sub.plan.name}{" "}
                <Badge className="ml-2 bg-[#00ADB5] text-white">
                  {sub.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Plan Duration:</strong>{" "}
                {sub.plan.duration_type.replace("_", " ")}
              </p>
              <p>
                <strong>Start Date:</strong>{" "}
                {new Date(sub.start_date).toLocaleDateString()}
              </p>
              <p>
                <strong>End Date:</strong>{" "}
                {new Date(sub.end_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Price:</strong> {sub.plan.price} BDT
              </p>
              <p>
                <strong>Payment Status:</strong> {sub.payment_status}
              </p>
              {/* <Button variant="outline" className="mt-2">
                Manage Plan
              </Button> */}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
