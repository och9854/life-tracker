import { useState } from 'react';
import { ArrowUpRight, Check, Heart, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PrimitiveShowcase() {
  const [checked, setChecked] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  return <main className="primitive-showcase">
    <header className="showcase-heading">
      <p className="eyebrow">LIFE JOURNAL · DESIGN SYSTEM</p>
      <h1>Small pieces, one familiar place.</h1>
      <p>Reusable controls for writing, planning, and looking back.</p>
    </header>
    <section className="showcase-grid" aria-label="Component preview">
      <Card className="showcase-card">
        <CardHeader><CardTitle>Buttons</CardTitle><CardDescription>Clear actions with a quiet hierarchy.</CardDescription></CardHeader>
        <CardContent className="showcase-row">
          <Button><Sparkles /> Primary</Button><Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button><Button variant="ghost">Quiet</Button>
          <Button variant="destructive">Delete</Button><Button disabled>Unavailable</Button>
        </CardContent>
      </Card>
      <Card className="showcase-card">
        <CardHeader><CardTitle>Choices and menus</CardTitle><CardDescription>Consistent selections for settings and repeat patterns.</CardDescription></CardHeader>
        <CardContent className="showcase-fields">
          <label>Repeat pattern<Select defaultValue="weekly"><SelectTrigger aria-label="Repeat pattern"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></label>
          <label className="showcase-check"><Checkbox checked={checked} onCheckedChange={value => setChecked(value === true)} /> Keep this choice</label>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>Open a dialog</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent showCloseButton={false}><DialogHeader><DialogTitle>One more small step</DialogTitle><DialogDescription>This dialog shows the shared focus, surface, and keyboard behavior.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button><Button onClick={() => setDialogOpen(false)}>Got it</Button></DialogFooter></DialogContent></Dialog>
        </CardContent>
      </Card>
      <Card className="showcase-card">
        <CardHeader><CardTitle>Writing fields</CardTitle><CardDescription>Labels, focus, and helpful empty states.</CardDescription></CardHeader>
        <CardContent className="showcase-fields">
          <div><Label htmlFor="showcase-title">Title</Label><Input id="showcase-title" placeholder="A thought worth keeping" /></div>
          <div><Label htmlFor="showcase-reflection">Reflection</Label><Textarea id="showcase-reflection" placeholder="Write a few words…" /></div>
          <div><Label htmlFor="showcase-disabled">Disabled</Label><Input id="showcase-disabled" disabled value="Read only" /></div>
        </CardContent>
      </Card>
      <Card className="showcase-card showcase-progress">
        <CardHeader><CardTitle>One apple slice at a time</CardTitle><CardDescription>Visible progress without turning a missed day into failure.</CardDescription></CardHeader>
        <CardContent className="showcase-row showcase-status"><Badge variant="secondary"><Check /> Saved</Badge><Badge variant="outline">This week · 2 / 4</Badge><Button variant="outline" size="sm"><Heart /> Mark a step</Button><Button size="icon" aria-label="Open detail"><ArrowUpRight /></Button></CardContent>
      </Card>
      <Card className="showcase-card showcase-dialog-card">
        <CardHeader><CardTitle>Focus and touch</CardTitle><CardDescription>Controls stay named and reachable from keyboard or touch.</CardDescription></CardHeader>
        <CardContent><Separator /><p>Use Tab to see the focus ring. Every control has a 44px touch area.</p></CardContent>
      </Card>
    </section>
    <p className="showcase-footnote">Development preview · <code>?showcase=1</code> · Try keyboard focus, select, checkbox, and dialog controls.</p>
  </main>;
}
