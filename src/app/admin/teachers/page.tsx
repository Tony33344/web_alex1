'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Teacher } from '@/types/database';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=teachers&orderBy=display_order&orderDir=asc')
      .then(r => r.json()).then(d => { setTeachers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'teachers', id, data: { is_active: !current } }) });
    setTeachers(teachers.map(t => t.id === id ? { ...t, is_active: !current } : t));
  }

  async function deleteTeacher(id: string) {
    if (!confirm('Delete this teacher?')) return;
    await fetch('/api/admin/data', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'teachers', id }) });
    setTeachers(teachers.filter(t => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage Role Teachers profiles</p>
        </div>
        <Link href="/admin/teachers/new">
          <Button className="gap-2"><Plus className="h-4 w-4" />New Teacher</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : teachers.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No teachers yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{teacher.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={teacher.is_active ? 'default' : 'secondary'}>{teacher.is_active ? 'Active' : 'Inactive'}</Badge>
                    <span>{teacher.title_en}</span>
                    {teacher.specialties.length > 0 && <span>· {teacher.specialties.join(', ')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(teacher.id, teacher.is_active)}>
                    {teacher.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/admin/teachers/${teacher.id}`}>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => deleteTeacher(teacher.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
