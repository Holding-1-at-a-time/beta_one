import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup, DropdownMenuRadioItem
} from
    "@/components/ui/dropdown-menu"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from
    "@/components/ui/table"
export default function Component() {
    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="bg-gradient-to-br from-[#00AE98] to-[#00D4B1] rounded-2xl shadow-2xl
overflow-hidden">
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold
text-primary-foreground">Invoices</h1>
                        <Button
                            size="lg"
                            className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow
duration-300"
                        >
                            <PlusIcon className="w-5 h-5" />
                            New Invoice
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
sm:gap-6 md:gap-8">
                        <Card className="bg-card text-card-foreground shadow-md hover:shadow-2xl
transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-medium">Invoice #1234</div>
                                    <Badge variant="secondary" className="text-xs shadow-md">
                                        Paid
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-2">

                                    <div className="text-sm text-muted-foreground">Client</div>
                                    <div className="text-sm font-medium">Acme Inc.</div>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Due Date</div>
                                    <div className="text-sm font-medium">2023-06-30</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Total</div>
                                    <div className="text-sm font-medium">$1,500.00</div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    Pay
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="bg-card text-card-foreground shadow-md hover:shadow-2xl
transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-medium">Invoice #5678</div>
                                    <Badge variant="outline" className="text-xs shadow-md">
                                        Pending
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Client</div>
                                    <div className="text-sm font-medium">Globex Corp.</div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Due Date</div>
                                    <div className="text-sm font-medium">2023-07-15</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Total</div>
                                    <div className="text-sm font-medium">$2,800.00</div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    Pay
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="bg-card text-card-foreground shadow-md hover:shadow-2xl
transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-medium">Invoice #9012</div>
                                    <Badge variant="outline" className="text-xs shadow-md">
                                        Overdue
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Client</div>
                                    <div className="text-sm font-medium">Stark Industries</div>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Due Date</div>
                                    <div className="text-sm font-medium">2023-06-01</div>

                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Total</div>
                                    <div className="text-sm font-medium">$3,200.00</div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    Pay
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="bg-card text-card-foreground shadow-md hover:shadow-2xl
transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-medium">Invoice #3456</div>
                                    <Badge variant="secondary" className="text-xs shadow-md">
                                        Paid
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Client</div>
                                    <div className="text-sm font-medium">Wayne Enterprises</div>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">Due Date</div>
                                    <div className="text-sm font-medium">2023-05-31</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Total</div>

                                    <div className="text-sm font-medium">$1,800.00</div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    Pay
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#00AE98] to-[#00D4B1]
opacity-20 blur-xl animate-pulse" />
            </div>
            <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-14">
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold
text-primary-foreground">Recent Invoices</h2>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow
duration-300"
                                >
                                    <FilterIcon className="w-4 h-4" />
                                    <span>Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by</DropdownMenuLabel>

                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked>Paid</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Unpaid</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Overdue</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow
duration-300"
                                >
                                    <ListOrderedIcon className="w-4 h-4" />
                                    <span>Sort</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value="date">
                                    <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="client">Client</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="bg-card text-card-foreground rounded-2xl shadow-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>

                                <TableCell>
                                    <div className="font-medium">INV-2023-06-01</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">Acme Inc.</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">2023-06-30</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-xs shadow-md">
                                        Paid
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium">$1,500.00</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className="font-medium">INV-2023-07-01</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">Globex Corp.</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">2023-07-15</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs shadow-md">
                                        Pending
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium">$2,800.00</div>

                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className="font-medium">INV-2023-06-01</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">Stark Industries</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">2023-06-01</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs shadow-md">
                                        Overdue
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium">$3,200.00</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className="font-medium">INV-2023-05-31</div>
                                </TableCell>
                                <TableCell>

                                    <div className="font-medium">Wayne Enterprises</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">2023-05-31</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-xs shadow-md">
                                        Paid
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium">$1,800.00</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
function FilterIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"

        >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    )
}
function ListOrderedIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="10" x2="21" y1="6" y2="6" />
            <line x1="10" x2="21" y1="12" y2="12" />
            <line x1="10" x2="21" y1="18" y2="18" />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </svg>
    )
}
function PlusIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"

            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
function XIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}