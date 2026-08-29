import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from app.core.config import settings

def generate_payslip_pdf(payroll_item, payroll, employee) -> str:
    """Generates a professional PDF payslip file using ReportLab and returns the absolute/relative filepath"""
    filename = f"payslip_{employee.employee_code}_{payroll.year}_{payroll.month:02d}.pdf"
    output_dir = os.path.join(settings.UPLOAD_DIR, "payslips")
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'CompanyTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E293B'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'CompanySubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        alignment=1
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=10,
        spaceAfter=6
    )
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Header
    story.append(Paragraph("AI-POWERED HRMS CORPORATION", title_style))
    story.append(Paragraph(f"CONFIDENTIAL PAYSLIP - {payroll.month:02d}/{payroll.year}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=15))

    # Employee & Department Details
    dept_name = employee.department.name if employee.department else "General"
    emp_details = [
        [
            Paragraph("<b>Employee ID:</b>", label_style), Paragraph(str(employee.employee_code), value_style),
            Paragraph("<b>Designation:</b>", label_style), Paragraph(str(employee.designation), value_style)
        ],
        [
            Paragraph("<b>Full Name:</b>", label_style), Paragraph(f"{employee.first_name} {employee.last_name}", value_style),
            Paragraph("<b>Department:</b>", label_style), Paragraph(str(dept_name), value_style)
        ],
        [
            Paragraph("<b>Email:</b>", label_style), Paragraph(str(employee.email), value_style),
            Paragraph("<b>Joining Date:</b>", label_style), Paragraph(str(employee.joining_date), value_style)
        ]
    ]

    emp_table = Table(emp_details, colWidths=[1.3*inch, 2.2*inch, 1.3*inch, 2.2*inch])
    emp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(emp_table)
    story.append(Spacer(1, 12))

    # Attendance & Working Days Summary
    story.append(Paragraph("Attendance & Service Summary", section_style))
    payable_days = payroll_item.present_days + payroll_item.approved_leave_days
    att_data = [
        [
            Paragraph("<b>Total Working Days:</b>", label_style), Paragraph(str(payroll_item.working_days), value_style),
            Paragraph("<b>Days Present:</b>", label_style), Paragraph(str(payroll_item.present_days), value_style),
            Paragraph("<b>Approved Leaves:</b>", label_style), Paragraph(str(payroll_item.approved_leave_days), value_style)
        ],
        [
            Paragraph("<b>Leave Without Pay (LWP):</b>", label_style), Paragraph(f"<font color='red'><b>{payroll_item.lwp_days}</b></font>", value_style),
            Paragraph("<b>Payable Days:</b>", label_style), Paragraph(f"<b>{payable_days}</b>", value_style),
            Paragraph("<b>Daily Pay Rate:</b>", label_style), Paragraph(f"${payroll_item.per_day_rate:,.2f}", value_style)
        ]
    ]
    att_table = Table(att_data, colWidths=[1.8*inch, 0.7*inch, 1.6*inch, 0.7*inch, 1.5*inch, 0.7*inch])
    att_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(att_table)
    story.append(Spacer(1, 15))

    # Earnings & Deductions Breakdown
    story.append(Paragraph("Earnings and Deductions Breakdown", section_style))
    salary_breakdown = [
        [
            Paragraph("<b>EARNINGS</b>", label_style), Paragraph("<b>AMOUNT</b>", label_style),
            Paragraph("<b>DEDUCTIONS</b>", label_style), Paragraph("<b>AMOUNT</b>", label_style)
        ],
        [
            Paragraph("Basic Monthly Salary", value_style), Paragraph(f"${payroll_item.basic_salary:,.2f}", value_style),
            Paragraph("LWP Deduction", value_style), Paragraph(f"${payroll_item.lwp_deduction:,.2f}", value_style)
        ],
        [
            Paragraph("Allowances & Perks", value_style), Paragraph(f"${payroll_item.allowances:,.2f}", value_style),
            Paragraph("Provident Fund (PF)", value_style), Paragraph(f"${payroll_item.pf_deduction:,.2f}", value_style)
        ],
        [
            Paragraph("", value_style), Paragraph("", value_style),
            Paragraph("Income Tax Deductions", value_style), Paragraph(f"${payroll_item.tax_deduction:,.2f}", value_style)
        ],
        [
            Paragraph("", value_style), Paragraph("", value_style),
            Paragraph("Other Deductions", value_style), Paragraph(f"${payroll_item.other_deductions:,.2f}", value_style)
        ],
        [
            Paragraph("<b>Total Gross Earnings</b>", label_style), Paragraph(f"<b>${payroll_item.total_earnings:,.2f}</b>", label_style),
            Paragraph("<b>Total Deductions</b>", label_style), Paragraph(f"<b>${payroll_item.total_deductions:,.2f}</b>", label_style)
        ]
    ]

    salary_table = Table(salary_breakdown, colWidths=[2.2*inch, 1.3*inch, 2.2*inch, 1.3*inch])
    salary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(salary_table)
    story.append(Spacer(1, 15))

    # Net Salary Highlight Banner
    net_data = [
        [
            Paragraph("<font size=12><b>NET DISBURSED SALARY:</b></font>", label_style),
            Paragraph(f"<font size=14 color='#16A34A'><b>${payroll_item.net_salary:,.2f}</b></font>", value_style)
        ]
    ]
    net_table = Table(net_data, colWidths=[3.5*inch, 3.5*inch])
    net_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#DCFCE7')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#16A34A')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(net_table)
    story.append(Spacer(1, 25))

    # Signature / Footer
    sign_data = [
        [
            Paragraph("<b>Employee Signature:</b> ____________________", label_style),
            Paragraph("<b>Authorized HR Manager:</b> <i>Digitally Verified (AI-HRMS)</i>", label_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[3.5*inch, 3.5*inch])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(sign_table)
    story.append(Spacer(1, 15))
    story.append(Paragraph("This is a computer-generated payslip generated by AI-HRMS. No physical signature required.", subtitle_style))

    doc.build(story)
    return filepath
