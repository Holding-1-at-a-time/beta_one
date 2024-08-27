"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Id } from '../../convex/_generated/dataModel';

interface VehiclePart {
    _id: Id<"vehicleParts">;
    name: string;
    x: number;
    y: number;
}

interface Hotspot {
    part: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
}

interface VehicleHotspotAssessmentProps {
    onAssessment: (assessment: Hotspot[]) => void;
}

const VehicleHotspotAssessment: React.FC<VehicleHotspotAssessmentProps> = ({ onAssessment }) => {
    const vehicleParts = useQuery(api.vehicles.listParts) || [];
    const [activeHotspot, setActiveHotspot] = useState<VehiclePart | null>(null);
    const [assessment, setAssessment] = useState<Hotspot[]>([]);

    useEffect(() => {
        onAssessment(assessment);
    }, [assessment, onAssessment]);

    const handleHotspotClick = (part: VehiclePart) => {
        setActiveHotspot(part);
    };

    const handleIssueSubmit = (issue: string, severity: 'low' | 'medium' | 'high') => {
        if (activeHotspot) {
            const newHotspot: Hotspot = { part: activeHotspot.name, issue, severity };
            setAssessment(prev => [...prev.filter(h => h.part !== activeHotspot.name), newHotspot]);
            setActiveHotspot(null);
        }
    };

    if (!vehicleParts.length) {
        return <div>Loading vehicle parts...</div>;
    }

    return (
        <div className="relative w-full max-w-[800px] mx-auto">
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-lg bg-gray-200">
                <img src="/vehicle-outline.svg" alt="Vehicle Diagram" className="w-full h-full object-contain" />
                {vehicleParts.map((part) => (
                    <Popover key={part._id}>
                        <PopoverTrigger asChild>
                            <Button
                                className={`absolute w-6 h-6 rounded-full ${assessment.some(h => h.part === part.name) ? 'bg-red-500' : 'bg-blue-500'
                                    } hover:bg-opacity-80 transition-colors`}
                                style={{ left: `${part.x}%`, top: `${part.y}%` }}
                                onClick={() => handleHotspotClick(part)}
                                aria-label={`Select ${part.name}`}
                            />
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <ConditionDetailForm
                                partName={part.name}
                                existingIssue={assessment.find(h => h.part === part.name)}
                                onSubmit={handleIssueSubmit}
                            />
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
            <div className="mt-4">
                <h3 className="font-bold">Reported Issues:</h3>
                <ul className="list-disc pl-5">
                    {assessment.map((hotspot, index) => (
                        <li key={index}>
                            {hotspot.part}: {hotspot.issue} (Severity: {hotspot.severity})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

interface ConditionDetailFormProps {
    partName: string;
    existingIssue?: Hotspot;
    onSubmit: (issue: string, severity: 'low' | 'medium' | 'high') => void;
}

const ConditionDetailForm: React.FC<ConditionDetailFormProps> = ({ partName, existingIssue, onSubmit }) => {
    const [issue, setIssue] = useState(existingIssue?.issue || '');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>(existingIssue?.severity || 'low');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(issue, severity);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor={`issue-${partName}`}>Issue with {partName}</Label>
                <Input
                    id={`issue-${partName}`}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Describe the issue"
                />
            </div>
            <div>
                <Label htmlFor={`severity-${partName}`}>Severity</Label>
                <Select value={severity} onValueChange={(value: 'low' | 'medium' | 'high') => setSeverity(value)}>
                    <SelectTrigger id={`severity-${partName}`}>
                        <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit">Submit</Button>
        </form>
    );
};

export default VehicleHotspotAssessment;