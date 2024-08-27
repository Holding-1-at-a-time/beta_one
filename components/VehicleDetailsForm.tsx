// components/VehicleDetailsForm.tsx

"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { VINScanner } from './VINScanner';

interface VehicleDetails {
    make: string;
    model: string;
    year: number;
    vin?: string;
}

interface VehicleDetailsFormProps {
    initialData?: VehicleDetails;
    onSubmit: (data: VehicleDetails) => void;
}

const VehicleDetailsForm: React.FC<VehicleDetailsFormProps> = ({ initialData, onSubmit }) => {
    const { register, handleSubmit, setValue } = useForm<VehicleDetails>({ defaultValues: initialData });
    const [showScanner, setShowScanner] = useState(false);

    const handleVINScan = (vin: string) => {
        setValue('vin', vin);
        setShowScanner(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="make">Make</Label>
                <Input id="make" {...register('make', { required: true })} />
            </div>
            <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" {...register('model', { required: true })} />
            </div>
            <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" {...register('year', { required: true, valueAsNumber: true })} />
            </div>
            <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" {...register('vin')} />
                <Button type="button" onClick={() => setShowScanner(true)} className="mt-2">
                    Scan VIN
                </Button>
            </div>
            {showScanner && <VINScanner onScan={handleVINScan} />}
            <Button type="submit">Save Vehicle Details</Button>
        </form>
    );
};

export default VehicleDetailsForm;