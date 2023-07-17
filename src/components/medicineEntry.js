import React from 'react'

export default class MedicineEntry extends React.Component {
    constructor(props) {
        super(props)
        const {medicineDetails} = props
        this.state = {
            medicineData: {
                companyName: medicineDetails?.companyName || '',
                drugName: medicineDetails?.drugName || '',
                description: medicineDetails?.description || '',
                expiryDate: [],
                quantity: medicineDetails?.quantity || 0
            },
        }
    }
    handleChange = (e) => {
        const {name, value} = e.target
        const {medicineData} = this.state
        medicineData[name] = name === 'expiryDate' ? [value] : value
        this.setState({medicineData})
    }
    handleMedicineEntrySubmit = e => {
        e.preventDefault()
        const {medicineData} = this.state 
        const {medicineDetails} = this.props
        const uniqueID = medicineDetails?.uniqueID || 0
        this.props.handleMedicineEntrySubmit(medicineData, uniqueID)
    }
    render() {
        const {medicineData} = this.state
        return (
            <div className="my-modal">
                    <h2>Medicine Stock Entry</h2>
                    <form onSubmit={this.handleMedicineEntrySubmit}>
                        <div className="form-group">
                            <label htmlFor="companyName">Copany Name:</label>
                            <input 
                                required
                                type="text" 
                                className="form-control" 
                                id="companyName" 
                                placeholder="Enter Company Name" 
                                name="companyName" 
                                value={medicineData.companyName} 
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="drugName">Drug Name:</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="drugName" 
                                placeholder="Enter Drug Name" 
                                name="drugName" 
                                value={medicineData.drugName}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description:</label>
                            <textarea 
                                className='form-control' 
                                id='description' 
                                name='description'
                                value={medicineData.description}
                                onChange={this.handleChange}
                            />
                        </div>
                        {
                            !this.props.medicineDetails && 
                            <div className="form-group">
                                <label htmlFor="expiryDate">Expiry:</label>
                                <input 
                                    required
                                    type="date" 
                                    className="form-control" 
                                    id="expiryDate" 
                                    placeholder="Enter password" 
                                    name="expiryDate" 
                                    value={medicineData.expiryDate}
                                    onChange={this.handleChange}
                                />
                            </div>
                        }
                        <div className="form-group">
                            <label htmlFor="quantity">Quantity:</label>
                            <input 
                                required
                                type="number" 
                                className="form-control" 
                                id="quantity" 
                                placeholder="Enter Quantity" 
                                name="quantity" 
                                value={medicineData.quantity}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className='text-center'>
                            <button 
                                type="submit" 
                                className="btn-lg btn-primary"
                            >
                                Save Medicine
                            </button>
                            {
                                this.props.medicineDetails &&
                                <button
                                    type='button'
                                    className='btn-lg btn-danger margin-left-10'
                                    onClick={() => this.props.deleteMedicine(this.props.medicineDetails.uniqueID)}
                                >
                                    Delete Medicine
                                </button>
                            }
                            <button 
                                type="button" 
                                className="btn-lg btn-secondary margin-left-10"
                                onClick={this.props.toggleMOdal}
                            >
                                Close
                            </button>
                        </div>
                    </form>
                </div>
        )
    }
}