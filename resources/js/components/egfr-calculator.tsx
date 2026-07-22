import { Calculator } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Sex = 'female' | 'male';

/**
 * CKD-EPI Creatinine 2021 (race-free) equation.
 * Scr in mg/dL, age in years. Returns eGFR in mL/min/1.73m².
 */
function ckdEpi2021(scr: number, age: number, sex: Sex): number {
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const ratio = scr / kappa;

    const egfr =
        142 *
        Math.pow(Math.min(ratio, 1), alpha) *
        Math.pow(Math.max(ratio, 1), -1.2) *
        Math.pow(0.9938, age) *
        (sex === 'female' ? 1.012 : 1);

    return Math.round(egfr);
}

export function EgfrCalculator({
    onUse,
}: {
    onUse: (egfr: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const [scr, setScr] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState<Sex>('male');

    const scrNum = parseFloat(scr);
    const ageNum = parseFloat(age);
    const valid = scrNum > 0 && ageNum > 0 && ageNum < 120;
    const result = valid ? ckdEpi2021(scrNum, ageNum, sex) : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Calculator className="size-4" /> eGFR calculator
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>eGFR calculator</DialogTitle>
                    <DialogDescription>
                        CKD-EPI Creatinine 2021 (race-free). Estimate only — confirm
                        with the lab report.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="calc-scr">Serum creatinine (mg/dL)</Label>
                        <Input
                            id="calc-scr"
                            type="number"
                            step="0.01"
                            min="0"
                            value={scr}
                            onChange={(e) => setScr(e.target.value)}
                            placeholder="e.g. 1.4"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="calc-age">Age (years)</Label>
                            <Input
                                id="calc-age"
                                type="number"
                                min="1"
                                max="119"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="e.g. 58"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="calc-sex">Sex</Label>
                            <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
                                <SelectTrigger id="calc-sex" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
                        <div className="text-xs text-muted-foreground">
                            Estimated eGFR
                        </div>
                        <div className="text-3xl font-semibold tabular-nums">
                            {result ?? '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            mL/min/1.73m²
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        disabled={result === null}
                        onClick={() => {
                            if (result !== null) {
                                onUse(result);
                                setOpen(false);
                            }
                        }}
                    >
                        Use as eGFR reading
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
