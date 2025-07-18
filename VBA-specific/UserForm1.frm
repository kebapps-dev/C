VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} UserForm1 
   Caption         =   "KEB Filter Part Number Selector"
   ClientHeight    =   9564.001
   ClientLeft      =   576
   ClientTop       =   1536
   ClientWidth     =   7512
   OleObjectBlob   =   "UserForm1.frx":0000
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "UserForm1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'Dim suppressComboEvents As Boolean

Private Sub CommandButton1_Click()
    ' Make Excel visible
     
    Application.Visible = True
    
    ' Show the workbook window (in case it's hidden)
    ThisWorkbook.Windows(1).Visible = True
    Worksheets("Launch App").Activate
    ' Maximize Excel window
    Application.WindowState = xlMaximized
    
    UserForm1.Hide
   
End Sub


Private Sub OpenPDF_Click()
    Set ws = ThisWorkbook.Sheets(UserForm1.ComboBox2.Value)
    OpenEmbeddedPDF (ws.Cells(ComboBox4.ListIndex + lowerBoundRow + 1, Step11Col))
End Sub

Private Sub UserForm_Initialize()
    Me.StartUpPosition = 2 ' Center screen
    
    'Hardcoded names of products
    'must match the name of the worksheet AND product in cell B2
    Mains1 = "Mains Choke (Z1)"
    Mains2 = "Harmonic Filter (Z1)"
    Mains3 = "Central HF Filter (E4, E6)"
    Mains4 = "Submounted Filters (E6)"
    Mains5 = "HF DC-Filter (E5,E6)"
    Motor1 = "Motor Choke (Z1,Z2)"
    Motor2 = "Sine Filter (Z1)"
    Combo1 = "Mains Choke + Sine Filter (Z1)"
    
    'initialize column letters
    Step2Col = "B" 'product
    Step3Col = "D" 'class
    Step4Col = "F" 'size
    Step5Col = "G" 'firstlabel
    Step6Col = "H" 'secondlabel
    Step7Col = "I" 'part number
    Step8Col = "J" 'notes
    Step9Col = "K" 'notes2
    Step10Col = "C" ' product info
    Step11Col = "M" 'embedded pdf
    
    'initialize ComboBox1
    ComboBox1.AddItem "Mains-Side"
    ComboBox1.AddItem "Motor-Side"
    ComboBox1.AddItem "Combo"
    ComboBox2.Enabled = False
    ComboBox3.Enabled = False
    ComboBox4.Enabled = False
    OpenPDF.Visible = False
    
    'Optional start with preloaded selection
    PreloadedSelection 0
End Sub

Private Sub ComboBox1_Change()
    If suppressComboEvents Then Exit Sub
    
    EnablingHandler 2
    
    EmptyLabels 1 'called from cb1
    
    ReturnCost " ", True
    
    Populate2
    
    PreloadedSelection 1
End Sub

Private Sub ComboBox2_Change()
    If suppressComboEvents Then Exit Sub
    
    Set ws = ThisWorkbook.Sheets(UserForm1.ComboBox2.Value)
    
    EnablingHandler 3
    
    EmptyLabels 2 'called from cb2
    
    Populate3
    
    PreloadedSelection 2
    
    ProductInfo.Caption = ws.Cells(2, Step10Col)
    ReturnCost " ", True
    ReturnCost ComboBox2.Value, False
End Sub

Private Sub ComboBox3_Change() 'class
    If suppressComboEvents Then Exit Sub
    
    EnablingHandler 4
    
    EmptyLabels 3 'called from cb3
    
    Dim i As Long
    Dim lastRow As Long
    
    Populate4
    
    With UserForm1.ComboBox4
        .Clear
            If IsArray(values) Then
                For i = lowerBoundRow To upperBoundRow
                    .AddItem values(i)
                Next i
            End If
    End With
    
    PreloadedSelection 3
End Sub

Private Sub ComboBox4_Change()
    If suppressComboEvents Then Exit Sub
    Dim ws As Worksheet
    Dim values As Variant
    
    Set ws = ThisWorkbook.Sheets(UserForm1.ComboBox2.Value)
    
    PartNumberLabel.Caption = ws.Cells(ComboBox4.ListIndex + lowerBoundRow + 1, Step7Col)
    FirstLabel.Caption = RemoveParenthesesContent(ws.Cells(1, Step5Col)) & ": " & ws.Cells(ComboBox4.ListIndex + lowerBoundRow + 1, Step5Col) & " " & ExtractLettersInParentheses(ws.Cells(1, Step5Col))
    SecondLabel.Caption = RemoveParenthesesContent(ws.Cells(1, Step6Col)) & ": " & ws.Cells(ComboBox4.ListIndex + lowerBoundRow + 1, Step6Col) & " " & ExtractLettersInParentheses(ws.Cells(1, Step6Col))
    Notes.Caption = ws.Cells(ComboBox4.ListIndex + lowerBoundRow + 1, Step8Col)
    Notes2.Caption = ws.Cells(ComboBox4.ListIndex + lowerBoundRow + 1, Step9Col)
    
    If ComboBox2.Value = Mains1 Then
        OpenPDF.Visible = True
    End If
End Sub

Private Sub UserForm_QueryClose(Cancel As Integer, CloseMode As Integer)
    Application.Quit
End Sub
