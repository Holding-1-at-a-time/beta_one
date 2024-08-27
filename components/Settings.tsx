import React from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SettingsIcon } from 'lucide-react';

export default function SettingsComponent() {
    const { organization } = useOrganization();
    const settings = useQuery(api.settings.getSettings, { organizationId: organization?.id ?? '' });
    const updateSettings = useMutation(api.settings.updateSettings);

    const handleUpdateSetting = async (key, value) => {
        if (organization?.id) {
            await updateSettings({ organizationId: organization.id, [key]: value });
        }
    };

    if (!settings) return <div>Loading settings...</div>;

    return (
        <div className="bg-gradient-to-br from-[#00AE98] to-[#00D5B6] shadow-2xl shadow-[#00AE98]/50 rounded-2xl p-8 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-lg text-white/80">Customize your account preferences</p>
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/10 transition-colors">
                    <SettingsIcon className="w-6 h-6" />
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md shadow-lg shadow-[#00AE98]/30 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle>Business Details</CardTitle>
                        <CardDescription>Update your company information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="company-name" className="text-white">Company Name</Label>
                                <Input
                                    id="company-name"
                                    value={settings.companyName}
                                    onChange={(e) => handleUpdateSetting('companyName', e.target.value)}
                                    className="bg-white/20 text-white placeholder:text-white/60 focus:ring-[#00AE98] focus:border-[#00AE98]"
                                />
                            </div>
                            <div>
                                <Label htmlFor="company-address" className="text-white">Address</Label>
                                <Textarea
                                    id="company-address"
                                    value={settings.companyAddress}
                                    onChange={(e) => handleUpdateSetting('companyAddress', e.target.value)}
                                    className="bg-white/20 text-white placeholder:text-white/60 focus:ring-[#00AE98] focus:border-[#00AE98]"
                                />
                            </div>
                            <div>
                                <Label htmlFor="company-phone" className="text-white">Phone Number</Label>
                                <Input
                                    id="company-phone"
                                    value={settings.companyPhone}
                                    onChange={(e) => handleUpdateSetting('companyPhone', e.target.value)}
                                    className="bg-white/20 text-white placeholder:text-white/60 focus:ring-[#00AE98] focus:border-[#00AE98]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md shadow-lg shadow-[#00AE98]/30 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle>Assessment Settings</CardTitle>
                        <CardDescription>Configure your assessment preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Enable AI Recommendations</h3>
                                    <p className="text-sm text-white/80">Use AI to provide service recommendations</p>
                                </div>
                                <Switch
                                    checked={settings.enableAIRecommendations}
                                    onCheckedChange={(checked) => handleUpdateSetting('enableAIRecommendations', checked)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="default-service-time" className="text-white">Default Service Time (minutes)</Label>
                                <Input
                                    id="default-service-time"
                                    type="number"
                                    value={settings.defaultServiceTime}
                                    onChange={(e) => handleUpdateSetting('defaultServiceTime', parseInt(e.target.value))}
                                    className="bg-white/20 text-white placeholder:text-white/60 focus:ring-[#00AE98] focus:border-[#00AE98]"
                                />
                            </div>
                            <div>
                                <Label htmlFor="price-calculation-method" className="text-white">Price Calculation Method</Label>
                                <Select
                                    value={settings.priceCalculationMethod}
                                    onValueChange={(value) => handleUpdateSetting('priceCalculationMethod', value)}
                                >
                                    <SelectTrigger className="bg-white/20 text-white focus:ring-[#00AE98] focus:border-[#00AE98]">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed Price</SelectItem>
                                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                                        <SelectItem value="variable">Variable Pricing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md shadow-lg shadow-[#00AE98]/30 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Customize your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">New Assessments</h3>
                                    <p className="text-sm text-white/80">Receive notifications for new assessments</p>
                                </div>
                                <Switch
                                    checked={settings.notifyNewAssessments}
                                    onCheckedChange={(checked) => handleUpdateSetting('notifyNewAssessments', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Assessment Updates</h3>
                                    <p className="text-sm text-white/80">Get notified when assessments are updated</p>
                                </div>
                                <Switch
                                    checked={settings.notifyAssessmentUpdates}
                                    onCheckedChange={(checked) => handleUpdateSetting('notifyAssessmentUpdates', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Daily Summary</h3>
                                    <p className="text-sm text-white/80">Receive a daily summary of activities</p>
                                </div>
                                <Switch
                                    checked={settings.notifyDailySummary}
                                    onCheckedChange={(checked) => handleUpdateSetting('notifyDailySummary', checked)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-md shadow-lg shadow-[#00AE98]/30 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>Connect your third-party services</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Stripe</h3>
                                    <p className="text-sm text-white/80">Accept payments securely</p>
                                </div>
                                <Button variant="outline" className="text-white hover:bg-white/10 transition-colors">
                                    {settings.stripeConnected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Google Calendar</h3>
                                    <p className="text-sm text-white/80">Sync your appointments</p>
                                </div>
                                <Button variant="outline" className="text-white hover:bg-white/10 transition-colors">
                                    {settings.googleCalendarConnected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">QuickBooks</h3>
                                    <p className="text-sm text-white/80">Manage your accounting</p>
                                </div>
                                <Button variant="outline" className="text-white hover:bg-white/10 transition-colors">
                                    {settings.quickBooksConnected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}