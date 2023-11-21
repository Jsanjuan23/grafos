import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { AiOutlineDelete } from "react-icons/ai";
import Swal from 'sweetalert2';
import Graph from 'vis-react';
import { WeightedGraph } from '../utils/GeneralUtils';

export const Mapa = () => {

  const [nodes, setNodes] = useState([
    { id: Date.now(), label: 'Almacén' },
  ]);

  const [edges, setEdges] = useState([]);

  const nodosForm = useFormik({
    initialValues: {
      label: ''
    },
    onSubmit: ({ label }) => {
      if (label === '') {
        abrirModalSwal("¡Espera!", "No has digitado el nombre aún", "info");
        return;
      } 
      const id = Date.now();
      setNodes([...nodes, { id, label }])
      nodosForm.resetForm();
    },
  });

  const aristasForm = useFormik({
    initialValues: {
      from: '',
      to: '',
      peso: ''
    },
    onSubmit: (values) => {
      if (values.from === '' || values.to === '' || values.peso === '') {
        abrirModalSwal("Jummm...", "Tienes errores en los valores digitados", "error");
        return;
      }
      values.from = +values.from;
      values.to = +values.to;
      values.peso = +values.peso;
      setEdges([...edges, { from: values.from, to: values.to, label: values.peso+"KM" }]); // Agregar 'label'
      aristasForm.resetForm();
    }
  });

  const caminoCortoForm = useFormik({
    initialValues: {
      from: '',
      to: ''
    },
    onSubmit: (values) => {
      if (values.from === '' || values.to === '') {
        abrirModalSwal("Error", "Digita los valores correctamente para buscar la ruta más cercana", "error");
        return;
      } 
      values.from = +values.from;
      values.to = +values.to;
      obtenerCaminoMasCorto(values);
      caminoCortoForm.resetForm();
    },
  });

  const eliminarNodo = (id) => {
    setNodes(nodes.filter((node) => node.id !== id));
  }

  const eliminarArista = (arista) => {
    setEdges(edges.filter((edge) => edge.from !== arista.from && edge.to !== arista.to));
  }

  const obtenerCaminoMasCorto = (values) => {
    var graph = new WeightedGraph();
    nodes.forEach((node) => {
      graph.addVertex(node.id.toString());
    });
    edges.forEach((edge) => {
      graph.addEdge(edge.from.toString(), edge.to.toString(), edge.peso);
    });
    const res = graph.Dijkstra(values.from.toString(), values.to.toString());
    abrirModalSwal("Camino más corto", res.join(" - "), "info");
  }

  const abrirModalSwal = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon
    });
  }
  

  var options = {
    layout: {
      hierarchical: true
    },
    edges: {
      color: '#000000',
      arrows: {
        to: { enabled: true, scaleFactor: 1, type: 'arrow' }
      },
      physics: true,
      scaling: {
        min: 1,
        max: 10,
      },
      shadow: true,
      smooth: {
        type: 'continuous',
      },
      width: 0.15,
      font: {
        size: 12,
        align: 'middle',
      },
    },
    interaction: {
      hoverEdges: true
    }
  };
  
  

  var events = {
      select: function(event) {
          var { nodes, edges } = event;
          console.log(nodes, edges)
      }
  };

  return (
    <div className='d-flex ht-100vh' id="padre">
      <div className='wd-50 configuracion'>
        <div className='lugares'>
          <span className='titulo-form-nodos'>Formulario de Lugares (Nodos)</span>
          <form onSubmit={nodosForm.handleSubmit} className='grid-forms' autoComplete='false'>
            <TextField
              id="label"
              className='text'
              label="Nombre"
              variant="outlined"
              value={nodosForm.values.label}
              onChange={nodosForm.handleChange}
            />
            <button className='rg-btn-primary' onClick={nodosForm.handleSubmit}>Crear</button>
          </form>
        </div>
        <div className='mt-4 lugares'>
          <span className='titulo-form-nodos'>Formulario de Carreteras (Aristas)</span>
          <form onSubmit={aristasForm.handleSubmit} className='grid-forms' autoComplete='false'>
            <TextField
              id="from"
              label="Desde"
              variant="outlined"
              value={aristasForm.values.from}
              onChange={aristasForm.handleChange}
            />
            <TextField
              id="to"
              label="Hasta"
              variant="outlined"
              value={aristasForm.values.to}
              onChange={aristasForm.handleChange}
            />
            <TextField
              id="peso"
              label="Distancia"
              variant="outlined"
              value={aristasForm.values.peso}
              onChange={aristasForm.handleChange}
            />
            <button className='rg-btn-primary'>Crear</button>
          </form>
        </div>
        <div className='mt-4 contenedor-logs'>
          <div className='logs-nodos'>
            {
              nodes.map((nodo) => {
                return (
                  <div key={nodo.id} className='rg-row'>
                    <div>
                      <span className='txt-detalle'>{nodo.id}</span> - <span className='txt-detalle'>{nodo.label}</span>
                    </div>
                    <span onClick={() => eliminarNodo(nodo.id)} className='rg-center-all'><AiOutlineDelete/></span>
                  </div>
                )
              })
            }
          </div>
          <div className='logs-aristas'>
          {
            edges.map((edge) => {
              return (
                <div key={edge.from+edge.to} className='rg-row'>
                  <span className='txt-detalle'>From: {edge.from}</span>
                  <span className='txt-detalle'>To: {edge.to}</span>
                  <span className='txt-detalle'>W: {edge.peso}</span>
                  <span className='rg-center-all' onClick={() => eliminarArista(edge)}><AiOutlineDelete/></span>
                </div>
              )
            })
            }
          </div>
        </div>
        <div className='mt-4' id="contenedorf">
          <span className='titulo-camino-corto'>¡Optimiza tus entregas!</span>
          <div className='contenedor-camino-corto'>
            <span className='mr-3'>Cuál es camino más corto desde: </span>
            <div className='campos'>
              <TextField
                id="from"
                label="Ingrese un lugar"
                variant="outlined"
                value={caminoCortoForm.values.from}
                onChange={caminoCortoForm.handleChange}
                className='text-corto'
              />
              <span className='mr-3'>Hasta: </span>
              <TextField
                id="to"
                label="Ingrese un lugar"
                variant="outlined"
                value={caminoCortoForm.values.to}
                onChange={caminoCortoForm.handleChange}
                className='text-corto'
              />
              <div className='interrogacion' onClick={caminoCortoForm.handleSubmit}>?</div>
            </div>
            
            
          </div>
        </div>
      </div>

      <div className='wd-50 mapa bg-contenedores'>
        <Graph
          key={Date.now()}
          graph={cloneDeep({ nodes, edges })}
          options={options}
          events={events}
        />
      </div>
    </div>
  )
}
