"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Client, Databases, ID, Query } from "node-appwrite"

type Entity = { $id?: string; name: string; slug?: string; profile?: string; stateSlug?: string }

function useAppwrite() {
	const endpoint = process.env.NEXT_PUBLIC_APPWRITE_PUBLIC_ENDPOINT as string
	const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string
	const client = useMemo(() => new Client().setEndpoint(endpoint).setProject(projectId), [endpoint, projectId])
	const databases = useMemo(() => new Databases(client), [client])
	return { databases }
}

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || 'vidyut_db'
const COL = {
	states: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STATES || process.env.APPWRITE_COLLECTION_STATES || 'states',
	mandals: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MANDALS || process.env.APPWRITE_COLLECTION_MANDALS || 'mandals',
	discoms: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISCOMS || process.env.APPWRITE_COLLECTION_DISCOMS || 'discoms',
	gens: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GENERATORS || process.env.APPWRITE_COLLECTION_GENERATORS || 'generators',
	trans: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSMISSIONS || process.env.APPWRITE_COLLECTION_TRANSMISSIONS || 'transmissions',
}

function Section({ title, collection, extraFields }: { title: string; collection: string; extraFields?: Array<{ key: keyof Entity; label: string }> }) {
	const { databases } = useAppwrite()
	const [items, setItems] = useState<Entity[]>([])
	const [name, setName] = useState("")
	const [slug, setSlug] = useState("")
	const [profile, setProfile] = useState("")
	const [stateSlug, setStateSlug] = useState("")
	const load = async () => {
		const res = await databases.listDocuments(DB_ID as string, collection, [Query.limit(100)])
		setItems(res.documents as unknown as Entity[])
	}
	useEffect(() => { load() }, [])
	const create = async () => {
		const data: any = { name }
		if (slug) data.slug = slug
		if (profile) data.profile = profile
		if (stateSlug) data.stateSlug = stateSlug
		await databases.createDocument(DB_ID as string, collection, ID.unique(), data)
		setName("")
		setSlug("")
		setProfile("")
		setStateSlug("")
		await load()
	}
	const remove = async (id?: string) => { if (!id) return; await databases.deleteDocument(DB_ID as string, collection, id); await load() }
	return (
		<Card className="rounded-2xl">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					<Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
					<Input placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} />
					{collection === COL.mandals && (
						<Input placeholder="State Slug" value={stateSlug} onChange={e => setStateSlug(e.target.value)} />
					)}
					<Input placeholder="Profile (JSON or text)" value={profile} onChange={e => setProfile(e.target.value)} />
					<Button onClick={create}>Create</Button>
				</div>
				<div className="divide-y rounded-md border">
					{items.map((it) => (
						<div key={it.$id} className="flex items-center justify-between p-3">
							<div className="min-w-0">
								<div className="font-medium truncate">{it.name}</div>
								<div className="text-xs text-muted-foreground truncate">{it.slug || it.stateSlug}</div>
							</div>
							<Button variant="outline" size="sm" onClick={() => remove(it.$id)}>Delete</Button>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default function AdminStateInfoPage() {
	return (
		<div className="container-wide py-6 space-y-6">
			<h1 className="text-2xl font-bold">State Info Management</h1>
			<Tabs defaultValue="states">
				<TabsList>
					<TabsTrigger value="states">States</TabsTrigger>
					<TabsTrigger value="mandals">Mandals</TabsTrigger>
					<TabsTrigger value="discoms">DISCOMs</TabsTrigger>
					<TabsTrigger value="generators">Generators</TabsTrigger>
					<TabsTrigger value="transmissions">Transmissions</TabsTrigger>
				</TabsList>
				<TabsContent value="states"><Section title="States" collection={COL.states} /></TabsContent>
				<TabsContent value="mandals"><Section title="Mandals" collection={COL.mandals} /></TabsContent>
				<TabsContent value="discoms"><Section title="DISCOMs" collection={COL.discoms} /></TabsContent>
				<TabsContent value="generators"><Section title="Generators" collection={COL.gens} /></TabsContent>
				<TabsContent value="transmissions"><Section title="Transmissions" collection={COL.trans} /></TabsContent>
			</Tabs>
		</div>
	)
}


