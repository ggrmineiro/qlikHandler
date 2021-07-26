<?php
if (isset($_POST['tabela_exportada'])) {
  //Pega os dados da tabela que vem pelo POST:
  $tabelaExportada = $_POST['tabela_exportada'];
} else {
  session_destroy();
  echo "
    <script>
        alert('Dados não encontrados. Refaça o procedimento.');
        window.history.back();
    </script>
    ";
}
?>

<!doctype html>
<html>

<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Exportar Tabela</title>
  <meta charset="utf-8">
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <meta name="HandheldFriendly" content="True">
  <meta name="MobileOptimized" content="320">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta http-equiv="cleartype" content="on">

  <!-- LIBS-->
  <!-- JQUERY -->
  <script src="https://qlikcage.sefaz.rs.gov.br/content/js/jquery.js"></script>

  <!--BOOTSTRAP-->
  <link rel="stylesheet" href="https://qlikcage.sefaz.rs.gov.br/content/css/bootstrap.css">
  <script src="https://qlikcage.sefaz.rs.gov.br/content/js/bootstrap.min.js"></script>

  <!-- Requistos para exportar para excel (XLSX) -->
  <script src="../recursos/js/lib/xlsx.core.min.js"></script>
  <script src="../recursos/js/lib/FileSaver.js"></script>
  <script src="../recursos/js/lib/tableexport.js"></script>

  <!--Ícones FontAwesome-->
  <link href="https://qlikcage.sefaz.rs.gov.br/content/css/all.css" rel="stylesheet">
  <script src="https://qlikcage.sefaz.rs.gov.br/content/js/all.js"></script>

  <!-- DATA TABLES-->
  <link rel="stylesheet" href="../recursos/css/lib/jquery.dataTables.min.css">

  <!--MASK-->
  <script src="../recursos/js/lib/jquery.maskMoney.min.js"></script>

  <!-- FUNÇÃO DE CRIPT -->
  <script src="https://qlikcage.sefaz.rs.gov.br/content/js/2.4.0-crypto-sha1-hmac-pbkdf2-blockmodes-aes.js"></script>

  <!-- ARQUIVOS PROJETO -->
  <!--Adicionando o CSS principal-->
  <link rel="stylesheet" href="https://qlikcage.sefaz.rs.gov.br/content/css/main.css">

  <!--Adicionando os JS's do Projeto-->
  <script src="../recursos/js/functions.js"></script>
  <script src="https://qlikcage.sefaz.rs.gov.br/content/js/funcao_enc_dec.js"></script>

</head>

<body>
  <?php echo $tabelaExportada ?>
</body>

<script>
  TableExport($('#tableQlikHandler'), {
    headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
    footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
    formats: ['xlsx', 'csv'], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
    filename: 'tabela PRM',
    bootstrap: true, // (Boolean), style buttons using bootstrap, (default: true)
    exportButtons: true, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
    position: 'top', // (top, bottom), position of the caption element relative to table, (default: 'bottom')
    // ignoreRows: null,                   // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
    ignoreCols: [14, 15], // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
    // trimWhitespace: true,               // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)
    RTL: false, // (Boolean), set direction of the worksheet to right-to-left (default: false)
    sheetname: 'TabelaPRM'
  });

  $(".xlsx").click();
  setTimeout(function() {
    window.close();
  }, 50); // sem delay não funciona
</script>

</html>