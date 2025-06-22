"use client";
import React, { useEffect, useState } from "react";
import { Users, DollarSign, Copy, PlusCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function Referrals() {
  const [referralCode, setReferralCode] = useState("");
  const [bonusTiers, setBonusTiers] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [payHistory, setPayHistory] = useState([]);
  const [referralList, setReferralList] = useState([]);
  const [filteredReferralList, setFilteredReferralList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const api = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken") || ""}`,
          },
        });

        const endpoints = [
          "referrals/code/",
          "referrals/list/",
          "referrals/bonus-tiers/",
          "referrals/campaigns/",
          "referrals/payouts/",
        ];

        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              const response = await api.get(endpoint);
              return { data: response.data, endpoint };
            } catch (error) {
              toast.error(`Failed to load data from ${endpoint}`);
              return { error, endpoint };
            }
          })
        );

        const [codeRes, listRes, tiersRes, campaignsRes, payoutsRes] = results;

        if (!codeRes.error) setReferralCode(codeRes.data.code);
        if (!listRes.error) {
          const referrals = listRes.data;
          setReferralList(referrals);
          setFilteredReferralList(referrals);
        }
        if (!tiersRes.error) setBonusTiers(tiersRes.data);
        if (!campaignsRes.error) setMyCampaigns(campaignsRes.data);
        if (!payoutsRes.error) setPayHistory(payoutsRes.data);
      } catch (error) {
        toast.error("An unexpected error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate referral stats
  const totalReferrals = referralList.length;
  const pendingReferrals = referralList.filter((r) => !r.credited).length;
  const totalEarnedCredits = referralList
    .filter((r) => r.credited)
    .reduce((sum, r) => sum + (r.credit_amount || 0), 0);
  const totalPaidOutCredits = payHistory
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const availableCredits = totalEarnedCredits - totalPaidOutCredits;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard");
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = referralList.filter((referral) =>
      referral.referred_user_phone.toLowerCase().includes(searchTerm)
    );
    setFilteredReferralList(filtered);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground">
          Manage your referral program, track referrals, and request payouts.
        </p>
      </div>

      {/* Referral Code and Stats */}
      <div className="flex flex-col gap-4 md:flex-row mt-12">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{referralCode || "Loading..."}</div>
              <Button variant="outline" size="icon" onClick={copyReferralCode} disabled={!referralCode}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Share this code with potential shop owners to earn rewards
            </p>
          </CardContent>
        </Card>

        <div className="grid flex-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? "..." : `${pendingReferrals} pending`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${totalEarnedCredits} credits`}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "..." : `${availableCredits} credits available`}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="w-full mt-12">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="bonus-tiers">Bonus Tiers</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Referral Campaigns</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Start Campaign
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {bonusTiers.length > 0 ? (
                  bonusTiers.map((tier) => (
                    <DropdownMenuItem
                      key={tier.id}
                      onClick={async () => {
                        try {
                          await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}referrals/campaigns/create/`,
                            { tier_id: tier.id },
                            {
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${Cookies.get("accessToken")}`,
                              },
                            }
                          );
                          toast.success("Campaign started!");
                          // Refetch campaigns if needed
                        } catch (error) {
                          toast.error("Failed to start campaign.");
                        }
                      }}
                    >
                      {tier.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No bonus tiers available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground pt-36">Loading campaigns...</p>
          ) : myCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCampaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{campaign.tier.name} Campaign</h3>
                      <Badge variant={campaign.is_active ? "success" : "outline"}>
                        {campaign.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><span className="font-medium">Referral Target:</span> {campaign.tier.referral_target}</p>
                      <p><span className="font-medium">Bonus Credits:</span> {campaign.tier.bonus_credits}</p>
                      <p><span className="font-medium">Referrals Made:</span> {campaign.referral_count}</p>
                      <p><span className="font-medium">Total Credits Earned:</span> {campaign.total_credits}</p>
                      <p><span className="font-medium">Start Date:</span> {new Date(campaign.start_date).toLocaleDateString()}</p>
                      <p><span className="font-medium">End Date:</span> {new Date(campaign.end_date).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground pt-36">No campaigns found.</p>
          )}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Your Referrals</h2>
            <Input
              placeholder="Search by phone..."
              className="w-[250px]"
              onChange={handleSearch}
            />
          </div>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground pt-36">Loading referrals...</p>
          ) : filteredReferralList.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground pt-36">No referrals found.</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referral ID</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferralList.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.id}</TableCell>
                        <TableCell>{referral.referred_user_phone}</TableCell>
                        <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={referral.credited ? "success" : "outline"}>
                            {referral.credited ? (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                Credited
                              </>
                            ) : (
                              "Pending"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{referral.credit_amount} credits</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bonus Tiers Tab */}
        <TabsContent value="bonus-tiers" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold tracking-tight">Bonus Tiers</h2>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground pt-36">Loading bonus tiers...</p>
          ) : bonusTiers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground pt-36">No bonus tiers available.</p>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {bonusTiers.map((tier, index) => (
                    <div key={tier.id} className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                          index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {tier.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Achieve {tier.referral_target} successful referrals to earn a {tier.bonus_credits} credit bonus
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Payout History</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>Request a payout of your available credits.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const credits = Number(formData.get("credits"));
                    if (credits > availableCredits) {
                      toast.error("Requested credits exceed available balance.");
                      return;
                    }
                    const requestData = {
                      credits,
                      payment_method: formData.get("payment_method"),
                      payment_details: formData.get("payment_details"),
                    };
                    try {
                      await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}referrals/payouts/create/`,
                        requestData,
                        {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("accessToken")}`,
                          },
                        }
                      );
                      toast.success("Payout requested successfully!");
                      // Refetch payHistory if needed
                    } catch (error) {
                      toast.error("Failed to request payout.");
                    }
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="credits">Credits to Payout</Label>
                      <Input
                        id="credits"
                        name="credits"
                        type="number"
                        placeholder="100"
                        required
                        min="1"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available credits: {loading ? "..." : availableCredits}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <select
                        id="payment_method"
                        name="payment_method"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="bkash"
                        required
                      >
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_details">Payment Details</Label>
                      <Input
                        id="payment_details"
                        name="payment_details"
                        type="text"
                        placeholder="e.g., 88017XXXXXXXX or Account Number"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Request Payout</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground pt-36">Loading payout history...</p>
          ) : payHistory.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground pt-36">No payout history available.</p>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payHistory.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>{new Date(payout.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{payout.amount} credits</TableCell>
                        <TableCell>{payout.method}</TableCell>
                        <TableCell>
                          <Badge variant={payout.status === "completed" ? "success" : "outline"}>
                            {payout.status === "completed" ? (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                Completed
                              </>
                            ) : (
                              "Pending"
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}